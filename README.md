# Online Judge System — High Level Design (HLD)

---

## 1. Overview

### Purpose

The **Online Judge System** is a scalable competitive programming platform where users can solve coding problems, submit solutions, and receive automated verdicts after execution against hidden test cases.

The system is designed to support:

- High concurrent submissions
- Secure sandboxed code execution
- Multi-language compilation and execution
- Contest leaderboards
- Scalable asynchronous evaluation

---

## 2. High-Level Architecture

```mermaid
flowchart TD
    FE["Frontend<br/>React + Monaco Editor"]
    BE["Backend Service<br/>Node.js · Express.js"]
    MDB[("MongoDB<br/>Document DB")]
    RD[("Redis<br/>Cache Layer")]
    MN[("MinIO<br/>Object Storage")]
    KF["Apache Kafka<br/>submission-jobs"]
    EW["Evaluation Worker<br/>Kafka Consumer"]
    DS["Docker Sandbox<br/>Secure Execution"]

    FE -->|"API Calls"| BE
    BE -->|"Read/Write"| MDB
    BE -->|"Session/Cache"| RD
    BE -->|"Store/Retrieve Files"| MN
    BE -->|"Enqueue Job"| KF
    KF -->|"Consume"| EW
    EW -->|"Fetch Source & Tests"| MN
    EW -->|"Spawn"| DS
    DS -->|"Update Verdict"| MDB
    DS -->|"Store Logs"| MN
```

---

## 3. Core Components

### 3.1 Frontend

Responsible for:

- User registration and login
- Problem listing and browsing
- In-browser code editor
- Submission history
- **Polling for verdict updates (every 500ms until verdict received)**
- Leaderboard display
- Contest participation

**Tech Stack:** React.js, Monaco Editor

---

### 3.2 Backend Service

Handles:

- Authentication and JWT validation
- API routing
- Submission processing
- Problem APIs
- Contest APIs
- Submission status endpoints for polling

**Tech Stack:** Node.js, Express.js

---

### 3.3 MongoDB

Stores all application data as documents:

- Users
- Problems
- **Contests** (NEW)
- Submissions
- Verdicts
- Leaderboards

---

### 3.4 Redis

Used for caching:

- User sessions
- Leaderboards
- Frequently accessed problems
- Recent submissions

---

### 3.5 MinIO

Object storage service used for:

- Source code files (uploaded on submission)
- Test case files
- Execution logs
- Problem assets (images, PDFs)

| Bucket             | Purpose              | File Path Example                          |
|--------------------|----------------------|--------------------------------------------|
| `submissions`      | User source code     | `submissions/{submissionId}.{language}`    |
| `testcases`        | Input/output files   | `testcases/{problemId}/input_{n}.txt`      |
| `execution-logs`   | Execution logs       | `execution-logs/{submissionId}.log`        |
| `problem-assets`   | Images and PDFs      | `problem-assets/{problemId}/{filename}`    |

---

### 3.6 Apache Kafka

Acts as the asynchronous message queue.

- **Topic:** `submission-jobs`

**Benefits:**
- Handles traffic spikes gracefully
- Decouples API layer from evaluation
- Improves horizontal scalability

---

### 3.7 Evaluation Worker

Consumes jobs from Kafka and:

- Downloads source code from MinIO using codeMinIOPath
- Downloads test cases from MinIO
- Starts isolated Docker containers
- Executes code per test case
- Generates and writes verdicts to MongoDB
- Uploads execution logs to MinIO

---

### 3.8 Docker Sandbox

Secure, isolated execution environment.

| Constraint   | Value      |
|--------------|------------|
| CPU Limit    | 1 vCPU     |
| Memory Limit | 256 MB     |
| Network      | Disabled   |
| Filesystem   | Read-only  |
| User         | Non-root   |

---

## 4. Authentication Flow

```mermaid
flowchart TD
    U["User"]
    BE["Backend Service"]
    MDB[("MongoDB")]
    JWT["JWT Token"]
    CL["Client Storage<br/>localStorage / cookie"]

    U -->|"Register / Login"| BE
    BE -->|"Store user"| MDB
    BE -->|"Generate"| JWT
    JWT -->|"Return to client"| CL
```

**JWT Payload:**
- `userId`
- `expiry` (TTL: 24 hours)

---

## 5. Submission & Verdict Flow

```mermaid
flowchart TD
    U["User Submits Code"]
    FE["Frontend"]
    BE["Backend API"]
    MN[("MinIO")]
    MDB[("MongoDB")]
    KF["Kafka"]
    EW["Evaluation Worker"]
    DC["Docker Container"]
    POLL["Polling Loop<br/>500ms intervals"]

    U -->|"Code + Language"| FE
    FE -->|"POST /submissions"| BE
    BE -->|"Validate JWT"| BE
    BE -->|"Upload source file"| MN
    BE -->|"Create submission<br/>verdict=PENDING"| MDB
    BE -->|"Enqueue job"| KF
    BE -->|"Return submissionId"| FE
    
    KF -->|"Consume"| EW
    EW -->|"Fetch source & tests"| MN
    EW -->|"Run in sandbox"| DC
    DC -->|"Compile & execute"| DC
    EW -->|"Determine verdict"| EW
    EW -->|"Update submission<br/>verdict + stats"| MDB
    EW -->|"Upload logs"| MN

    FE -->|"GET /submissions/:id"| BE
    POLL -->|"Loop until<br/>verdict != PENDING"| FE
    BE -->|"Return submission"| POLL
    POLL -->|"Display result"| U
```

**Key Points:**
- Source code is **always uploaded to MinIO** immediately on submission
- `codeMinIOPath` field stores the explicit path (e.g., `submissions/507f1f77bcf86cd799439011.py`)
- Frontend polls every 500ms for verdict updates until verdict is not `PENDING`
- Worker updates MongoDB with final verdict and execution statistics

---

## 6. Database Schema

### `users` (MongoDB Collection: `authusers`)

| Field       | Type     | Validation / Constraints                                 | Description                   |
|-------------|----------|----------------------------------------------------------|-------------------------------|
| `_id`       | ObjectId | Automatically generated by MongoDB                       | Primary unique identifier     |
| `firstName` | String   | Required, trimmed, 2-40 chars                            | User's first name             |
| `lastName`  | String   | Required, trimmed, 2-40 chars                            | User's last name              |
| `email`     | String   | Required, unique, trimmed, lowercased, email regex match | User's unique email address   |
| `password`  | String   | Required, min length 6                                   | Secure Bcrypt-hashed password |
| `createdAt` | Date     | Default: `Date.now()`                                    | Account creation timestamp    |

---

### `problems` (MongoDB Collection: `problems`)

| Field         | Type     | Validation / Constraints                     | Description                              |
|---------------|----------|----------------------------------------------|------------------------------------------|
| `_id`         | ObjectId | Automatically generated                      | Primary unique identifier                |
| `title`       | String   | Required, trimmed                            | Problem title                            |
| `statement`   | String   | Required                                     | Full problem description and constraints |
| `difficulty`  | String   | Required, Enum: `['Easy', 'Medium', 'Hard']` | Problem difficulty level                 |
| `timeLimit`   | Number   | Required, Integer (ms)                       | Execution time limit                     |
| `memoryLimit` | Number   | Required, Integer (MB)                       | Execution memory limit                   |
| `createdAt`   | Date     | Default: `Date.now()`                        | Timestamp when problem was created       |

---

### `contests` (MongoDB Collection: `contests`) — **UPDATED**

| Field            | Type       | Validation / Constraints                        | Description                                    |
|------------------|------------|-------------------------------------------------|------------------------------------------------|
| `_id`            | ObjectId   | Automatically generated                         | Primary key                                    |
| `title`          | String     | Required, trimmed, unique                       | Contest name                                   |
| `description`    | String     | Optional                                        | Contest description and rules                  |
| `startTime`      | Date       | Required                                        | Contest start timestamp                        |
| `endTime`        | Date       | Required                                        | Contest end timestamp                          |
| `problems`       | [ObjectId] | Required, Ref: `Problem`                        | Array of problem IDs in contest                |
| `status`         | String     | Enum: `['UPCOMING', 'LIVE', 'ENDED']`           | Current status (derived from timestamps)       |
| `participantCount` | Number   | Integer, default 0                              | Count of users registered                      |
| `duration`       | Number     | Required, Integer (minutes)                     | Contest duration                               |
| `visibility`     | String     | Enum: `['PUBLIC', 'PRIVATE']`, default: `PUBLIC`| Contest visibility level                       |
| `createdBy`      | ObjectId   | Ref: `User`                                     | Admin/creator of contest                       |
| `createdAt`      | Date       | Default: `Date.now()`                           | Contest creation timestamp                     |

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "title": "Monthly Challenge #5",
  "description": "Compete with others on dynamic programming problems",
  "startTime": ISODate("2026-06-10T18:00:00Z"),
  "endTime": ISODate("2026-06-10T20:00:00Z"),
  "problems": [ObjectId("507f1f77bcf86cd799439012"), ObjectId("507f1f77bcf86cd799439013")],
  "status": "LIVE",
  "participantCount": 247,
  "duration": 120,
  "visibility": "PUBLIC",
  "createdBy": ObjectId("507f1f77bcf86cd799439001"),
  "createdAt": ISODate("2026-06-01T10:00:00Z")
}
```

---

### `contestregistrations` (MongoDB Collection: `contestregistrations`) — **NEW**

| Field          | Type     | Validation / Constraints                        | Description                                  |
|----------------|----------|-------------------------------------------------|----------------------------------------------|
| `_id`          | ObjectId | Automatically generated                         | Primary key                                  |
| `contestId`    | ObjectId | Required, Ref: `Contest`                        | Reference to the registered contest          |
| `userId`       | ObjectId | Required, Ref: `User`                           | Reference to the registered user             |
| `registeredAt` | Date     | Default: `Date.now()`                           | Registration timestamp                       |
| `status`       | String   | Enum: `['REGISTERED', 'UNREGISTERED']`          | Current registration status                  |

---

### `contestsubmissions` (MongoDB Collection: `contestsubmissions`) — **NEW**

| Field          | Type     | Validation / Constraints                        | Description                                  |
|----------------|----------|-------------------------------------------------|----------------------------------------------|
| `_id`          | ObjectId | Automatically generated                         | Primary key                                  |
| `contestId`    | ObjectId | Required, Ref: `Contest`                        | Reference to the contest                     |
| `userId`       | ObjectId | Required, Ref: `User`                           | Reference to the participant                 |
| `problemId`    | ObjectId | Required, Ref: `Problem`                        | Reference to the solved problem              |
| `submissionId` | ObjectId | Required, Ref: `Submission`                     | Reference to the underlying submission       |
| `score`        | Number   | Default: 0                                      | Score achieved (points based on difficulty)  |
| `verdict`      | String   | Required                                        | Evaluation verdict                           |

---

### `submissions` (MongoDB Collection: `submissions`)

| Field            | Type     | Validation / Constraints                                           | Description                                                    |
|------------------|----------|--------------------------------------------------------------------|------------------------------------------------------------|
| `_id`            | ObjectId | Automatically generated                                            | Primary unique identifier                                  |
| `userId`         | ObjectId | Required, Ref: `AuthUser`                                          | The user who submitted the code                            |
| `problemId`      | ObjectId | Required, Ref: `Problem`                                           | The problem being solved                                   |
| `contestId`      | ObjectId | Optional, Ref: `contests`                                          | Contest ID if submitted during a contest                   |
| `language`       | String   | Required, Enum: `['cpp', 'python', 'java', 'javascript']`          | Programming language used                                  |
| `codeMinIOPath`  | String   | Required, pattern: `submissions/{submissionId}.{ext}`              | **EXPLICIT:** MinIO file path, NOT inline code             |
| `verdict`        | String   | Enum: `['PENDING', 'AC', 'WA', 'TLE', 'MLE', 'RE', 'CE']`         | Verdict of execution                                       |
| `executionTime`  | Number   | Optional, Integer (ms)                                             | Actual execution time; null if PENDING or CE               |
| `memoryUsed`     | Number   | Optional, Integer (MB)                                             | Peak memory used; null if PENDING or CE                    |
| `logMinIOPath`   | String   | Optional, pattern: `execution-logs/{submissionId}.log`             | Path to execution log in MinIO                             |
| `createdAt`      | Date     | Default: `Date.now()`                                              | Submission timestamp                                       |
| `updatedAt`      | Date     | Updated on verdict assignment                                      | Last update timestamp                                      |

**Key Clarifications:**
- **`codeMinIOPath` is ALWAYS populated** — source code is uploaded to MinIO immediately on submission
- **Never store raw code in MongoDB** — this field contains ONLY the path reference
- **All file references are explicit paths** — workers can deterministically fetch files using these paths
- Example path: `submissions/507f1f77bcf86cd799439011.py`

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "userId": ObjectId("507f1f77bcf86cd799439010"),
  "problemId": ObjectId("507f1f77bcf86cd799439012"),
  "contestId": null,
  "language": "python",
  "codeMinIOPath": "submissions/507f1f77bcf86cd799439013.py",
  "verdict": "AC",
  "executionTime": 245,
  "memoryUsed": 32,
  "logMinIOPath": "execution-logs/507f1f77bcf86cd799439013.log",
  "createdAt": ISODate("2026-06-02T10:30:00Z"),
  "updatedAt": ISODate("2026-06-02T10:30:05Z")
}
```

---

## 7. Verdict Reference

| Verdict   | Full Form              | Description                                                  |
|-----------|------------------------|--------------------------------------------------------------|
| `AC`      | Accepted               | All test cases passed                                        |
| `WA`      | Wrong Answer           | Output doesn't match expected                               |
| `TLE`     | Time Limit Exceeded    | Execution exceeded allowed time                             |
| `MLE`     | Memory Limit Exceeded  | Memory usage exceeded allowed limit                         |
| `RE`      | Runtime Error          | Program crashed during execution                            |
| `CE`      | Compilation Error      | Code failed to compile                                       |
| `PENDING` | —                      | Submission is queued or being evaluated; verdict not ready  |

---

## 8. Polling Mechanism (Verdict Retrieval) — **EXPLICIT DOCUMENTATION**

Since WebSockets are a future enhancement, the frontend uses **HTTP polling** to fetch verdict updates.

### Frontend Polling Implementation

```javascript
async function pollForVerdict(submissionId, maxAttempts = 120) {
  let attempts = 0;
  const pollIntervalMs = 500; // Poll every 500ms

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const submission = await response.json();

      if (submission.verdict !== 'PENDING') {
        // Verdict is ready
        console.log(`Verdict received: ${submission.verdict}`);
        return submission;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      console.error('Polling error:', error);
      attempts++;
    }
  }

  throw new Error('Verdict not received within timeout (60s)');
}
```

### Polling Strategy

- **Poll Interval:** 500ms (balance between responsiveness and server load)
- **Max Attempts:** 120 (6 minutes timeout; adjust based on system capacity)
- **Backend Response:** Fast key-value lookup from MongoDB (submission ID is indexed)
- **Scalability:** Each polling request is stateless; easy to handle 1000s of concurrent pollers

### User Flow Example

1. User submits code → Backend returns `submissionId`
2. Frontend calls `pollForVerdict(submissionId)`
3. Polling loop sends `GET /api/submissions/{submissionId}` every 500ms
4. Worker evaluates in parallel (1-5 seconds typical)
5. When verdict ≠ PENDING, polling stops and result is displayed
6. User sees execution time, memory used, and detailed verdict

### Backend Endpoint Response

**While PENDING (first ~2-3 polls):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439010",
  "problemId": "507f1f77bcf86cd799439012",
  "language": "python",
  "verdict": "PENDING",
  "executionTime": null,
  "memoryUsed": null,
  "createdAt": "2026-06-02T10:30:00Z"
}
```

**After Verdict Received:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439010",
  "problemId": "507f1f77bcf86cd799439012",
  "language": "python",
  "verdict": "AC",
  "executionTime": 245,
  "memoryUsed": 32,
  "logMinIOPath": "execution-logs/507f1f77bcf86cd799439013.log",
  "createdAt": "2026-06-02T10:30:00Z",
  "updatedAt": "2026-06-02T10:30:05Z"
}
```

### Future Enhancement: WebSockets

Once implemented, replace polling with event-driven updates:
```javascript
const socket = io('/submissions');
socket.on('verdict:' + submissionId, (submission) => {
  if (submission.verdict !== 'PENDING') {
    displayResult(submission); // No more polling needed
  }
});
```

---

## 9. Scalability Design

| Strategy           | Approach                                                       |
|--------------------|----------------------------------------------------------------|
| Horizontal Scaling | Evaluation workers scale independently via Kafka consumers     |
| Traffic Buffering  | Kafka queues absorb submission bursts during contests          |
| Cache Layer        | Redis reduces database read load on hot data                   |
| Stateless API      | Enables easy backend horizontal scaling behind a load balancer |

---

## 10. Security Design

| Layer             | Mechanism                                          |
|-------------------|----------------------------------------------------|
| Authentication    | JWT-based, short-lived tokens (24h TTL)            |
| Sandbox Isolation | Isolated Docker container per submission           |
| File Access       | Files stored in MinIO, accessed via presigned URLs |
| Network Isolation | No outbound internet access inside containers      |
| User Isolation    | Containers run as non-root user                    |
| Resource Limits   | CPU 1 vCPU, Memory 256MB, Process limit 32         |

---

## 11. Non-Functional Requirements

| Requirement        | Target    |
|--------------------|-----------|
| Concurrent Users   | 1,000+    |
| Evaluation Latency | < 5s      |
| API Response Time  | < 200ms   |
| Availability       | 99.9%     |

---

## 12. Technology Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Frontend       | React.js, Monaco Editor |
| Backend API    | Node.js, Express.js     |
| Database       | MongoDB (Mongoose ODM)  |
| Cache          | Redis                   |
| Object Storage | MinIO                   |
| Message Queue  | Apache Kafka            |
| Code Execution | Docker (sandboxed)      |

---

## 13. Future Enhancements

- [ ] Kubernetes deployment with auto-scaling workers
- [ ] WebSocket-based live verdict streaming (replaces polling)
- [ ] Plagiarism detection engine
- [ ] Distributed MinIO for high availability storage
- [ ] Multi-region deployment
- [ ] Support for more programming languages
- [ ] Editorial and solution discussion sections

---

## 14. Project Goals

| Goal                         | Detail                                     |
|------------------------------|--------------------------------------------|
| Scalable Architecture        | Kafka + stateless workers + Redis caching  |
| Secure Execution             | Isolated Docker sandbox with strict limits |
| Fast Verdict Generation      | Target < 5s end-to-end evaluation          |
| High Availability            | 99.9% uptime SLA                           |
| Contest-Ready Infrastructure | Handles 1000+ concurrent submissions       |

---

## 15. Contest APIs & Role-Based Access Control (RBAC) — **NEW**

The platform implements robust role-based access control (RBAC) to differentiate between **Admins** and standard **Users** during contests.

### Role Permissions Matrix

| Permission / Action | Admin | User |
|---------------------|-------|------|
| Create Contest      | Yes   | No   |
| Modify/Delete       | Yes   | No   |
| View Participants   | Yes   | No   |
| Register / Join     | No    | Yes  |
| Submit Solutions    | No    | Yes  |
| Appear on Board     | No    | Yes  |

### API Endpoints

#### Admin Endpoints
- `POST   /api/admin/contests` — Create a new contest
- `PUT    /api/admin/contests/:id` — Update contest details
- `DELETE /api/admin/contests/:id` — Delete a contest and clean up registrations
- `GET    /api/admin/contests/:id/participants` — View registered participants list

#### User Endpoints
- `GET  /api/contests` — List all available contests
- `GET  /api/contests/:id` — Get specific contest details (hides problems if upcoming)
- `POST /api/contests/:id/register` — Register for a contest (open until endTime)
- `POST /api/contests/:id/join` — Join an active contest (only after registration)
- `GET  /api/contests/:id/status` — Check user registration status (`{ registered: boolean, status: string }`)
- `GET  /api/contests/:id/leaderboard` — Fetch contest leaderboard ranked by score and submission speed

---

*This document is for educational and learning purposes.*  
*Author: Platform Engineering Team*  
*Version: 2.1 (Contest Management & RBAC incorporated)*