/**
 * End-to-end API test script for the online judge platform.
 * Run: node backend/test/e2e.js
 */

const BASE = process.env.BASE_URL || "http://localhost:5000";

const results = [];
let passed = 0;
let failed = 0;

const assert = (name, condition, detail = "") => {
    if (condition) {
        passed++;
        results.push({ name, status: "PASS" });
        console.log(`  ✓ ${name}`);
    } else {
        failed++;
        results.push({ name, status: "FAIL", detail });
        console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
    }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(method, path, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function runTests() {
    console.log("\n=== Online Judge E2E Tests ===\n");
    const ts = Date.now();
    const email = `e2e_${ts}@test.com`;
    const password = "testpass123";
    let token = "";
    let problemId = "";
    let submissionId = "";

    // Health check
    console.log("1. Health & Public APIs");
    let res = await request("GET", "/");
    assert("Health check", res.status === 200 && res.data.status === "healthy");

    res = await request("GET", "/api/problem/");
    assert("Fetch problems", res.status === 200 && Array.isArray(res.data.problems));

    // Invalid login
    console.log("\n2. Authentication");
    res = await request("POST", "/api/user/login", { email: "bad@test.com", password: "wrong" });
    assert("Invalid login rejected", res.status === 400);

    // Register
    res = await request("POST", "/api/user/register", {
        firstName: "E2E", lastName: "Tester", email, password
    });
    assert("User registration", res.status === 201 && res.data.token);
    token = res.data.token;

    // Current user
    res = await request("GET", "/api/user/get-current-user", null, token);
    assert("Get current user", res.status === 200 && res.data.data?.email === email);

    // Unauthorized access
    res = await request("POST", "/api/submission/submit", { problemId: "fake", language: "python", code: "print(1)" });
    assert("Unauthorized submission blocked", res.status === 401);

    // Browse problems
    console.log("\n3. Problem Management");
    res = await request("GET", "/api/problem/");
    const problems = res.data.problems || [];
    assert("Problems list available", problems.length > 0, `found ${problems.length}`);
    problemId = problems[0]._id;

    res = await request("GET", `/api/problem/${problemId}`);
    assert("Problem details", res.status === 200 && res.data.problem?.title);

    // Submit wrong answer
    console.log("\n4. Submission & Evaluation");
    res = await request("POST", "/api/submission/submit", {
        problemId,
        language: "python",
        code: "print('wrong answer')"
    }, token);
    assert("Submit code", res.status === 201 && res.data.submission?._id);
    submissionId = res.data.submission._id;

    // Poll for verdict
    let verdict = "PENDING";
    for (let i = 0; i < 15; i++) {
        await sleep(500);
        res = await request("GET", `/api/submission/${submissionId}`, null, token);
        verdict = res.data.submission?.verdict;
        if (verdict && verdict !== "PENDING") break;
    }
    assert("Wrong answer verdict", verdict === "WRONG_ANSWER", `got ${verdict}`);

    // AI analysis generated
    assert("AI analysis present", !!res.data.aiAnalysis?.complexity?.time, "missing AI analysis");

    // Submit compilation error
    res = await request("POST", "/api/submission/submit", {
        problemId,
        language: "python",
        code: "def broken(:\n    pass"
    }, token);
    assert("Submit broken code", res.status === 201, `status ${res.status}: ${JSON.stringify(res.data)}`);
    const ceId = res.data.submission._id;

    let ceVerdict = "PENDING";
    for (let i = 0; i < 25; i++) {
        await sleep(600);
        res = await request("GET", `/api/submission/${ceId}`, null, token);
        ceVerdict = res.data.submission?.verdict;
        if (ceVerdict && ceVerdict !== "PENDING") break;
    }
    assert("Compilation error verdict", ceVerdict === "COMPILATION_ERROR", `got ${ceVerdict}`);

    // Submit accepted solution for Two Sum if available
    const twoSum = problems.find((p) => p.title === "Two Sum");
    if (twoSum) {
        const acceptedCode = `n = int(input())
arr = list(map(int, input().split()))
target = int(input())
for i in range(n):
    for j in range(i+1, n):
        if arr[i] + arr[j] == target:
            print(i, j)
            break
    else:
        continue
    break`;
        res = await request("POST", "/api/submission/submit", {
            problemId: twoSum._id,
            language: "python",
            code: acceptedCode
        }, token);
        assert("Submit accepted solution", res.status === 201);
        const acId = res.data.submission._id;
        let acVerdict = "PENDING";
        for (let i = 0; i < 20; i++) {
            await sleep(500);
            res = await request("GET", `/api/submission/${acId}`, null, token);
            acVerdict = res.data.submission?.verdict;
            if (acVerdict && acVerdict !== "PENDING") break;
        }
        assert("Accepted verdict", acVerdict === "ACCEPTED", `got ${acVerdict}`);
    }

    // Leaderboard
    console.log("\n5. Leaderboard");
    res = await request("GET", "/api/leaderboard/");
    assert("Global leaderboard", res.status === 200 && Array.isArray(res.data.leaderboard));

    const userId = (await request("GET", "/api/user/get-current-user", null, token)).data.data._id;
    res = await request("GET", `/api/leaderboard/user/${userId}`);
    assert("User ranking", res.status === 200 && res.data.entry?.userId);

    // Compiler requires auth
    console.log("\n6. Security");
    res = await request("POST", "/api/compiler/run", { language: "python", code: "print(1)" });
    assert("Compiler requires auth", res.status === 401);

    // Payload validation
    res = await request("POST", "/api/submission/submit", { problemId, language: "python" }, token);
    assert("Missing code rejected", res.status === 400);

    // Profile update
    console.log("\n7. Profile Management");
    res = await request("PUT", "/api/user/profile", { firstName: "E2EUpdated" }, token);
    assert("Profile update", res.status === 200 && res.data.data?.firstName === "E2EUpdated");

    // Rate limit on login (6th attempt should fail)
    console.log("\n8. Rate Limiting");
    let rateLimited = false;
    for (let i = 0; i < 6; i++) {
        const r = await request("POST", "/api/user/login", { email: "bad@test.com", password: "wrong" });
        if (r.status === 429) { rateLimited = true; break; }
    }
    assert("Login rate limit enforced", rateLimited);

    // Summary
    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
    console.error("E2E test crashed:", err);
    process.exit(1);
});
