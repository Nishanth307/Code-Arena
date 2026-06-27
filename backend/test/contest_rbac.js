const mongoose = require("mongoose");
const settings = require("../config/settings");
const User = require("../model/user");
const Problem = require("../model/problem");
const Contest = require("../model/contest");
const ContestRegistration = require("../model/contestRegistration");
const ContestSubmission = require("../model/contestSubmission");

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
    console.log("\n=== Contest RBAC & Management E2E Tests ===\n");

    // Connect to database
    await mongoose.connect(settings.MONGODB_URI, { dbName: settings.APP_NAME });
    console.log("Connected to MongoDB for test verification.\n");

    const ts = Date.now();
    const adminEmail = `admin_${ts}@test.com`;
    const userEmail = `user_${ts}@test.com`;
    const password = "password123";

    let adminToken = "";
    let userToken = "";
    let adminId = "";
    let userId = "";
    let problemId = "";

    // 1. Create Admin & User
    console.log("1. Creating test accounts");
    let res = await request("POST", "/api/user/register", {
        firstName: "Admin", lastName: "Contest", email: adminEmail, password
    });
    assert("Register admin account", res.status === 201 && res.data.token);
    adminToken = res.data.token;
    adminId = res.data.user._id;

    // Promote to Admin in Database
    await User.findByIdAndUpdate(adminId, { role: "ADMIN" });
    console.log("  Promoted Admin account in DB.");

    // Log in admin to get a token with the ADMIN role
    res = await request("POST", "/api/user/login", { email: adminEmail, password });
    console.log("Admin login response user:", res.data.user);
    assert("Admin login to get admin role token", res.status === 200 && res.data.token);
    adminToken = res.data.token;

    res = await request("POST", "/api/user/register", {
        firstName: "User", lastName: "Contest", email: userEmail, password
    });
    assert("Register user account", res.status === 201 && res.data.token);
    userToken = res.data.token;
    userId = res.data.user._id;

    // Get a seeded problem
    const prob = await Problem.findOne();
    if (prob) {
        problemId = prob._id.toString();
    } else {
        console.error("No problems found in DB. Make sure database is seeded.");
        process.exit(1);
    }

    // 2. Admin Permissions Test
    console.log("\n2. Testing Admin Permissions");
    const contestData = {
        title: `Contest ${ts}`,
        description: "Contest Description",
        startTime: new Date(Date.now() + 5000), // starts in 5s
        endTime: new Date(Date.now() + 30000), // ends in 30s
        duration: 10,
        problems: [problemId],
        visibility: "PUBLIC"
    };

    // Create Contest (Admin)
    res = await request("POST", "/api/admin/contests", contestData, adminToken);
    if (res.status !== 201) {
        console.error("Create contest failed:", res.status, res.data);
    }
    assert("Admin can create contest", res.status === 201 && res.data.contest?._id);
    const contestId = res.data.contest?._id;

    // Update Contest (Admin)
    res = await request("PUT", `/api/admin/contests/${contestId}`, { title: `Updated Contest ${ts}` }, adminToken);
    assert("Admin can update contest", res.status === 200 && res.data.contest?.title === `Updated Contest ${ts}`);

    // Admin cannot register
    res = await request("POST", `/api/contests/${contestId}/register`, {}, adminToken);
    assert("Admin cannot register for contest", res.status === 403);

    // Admin cannot join
    res = await request("POST", `/api/contests/${contestId}/join`, {}, adminToken);
    assert("Admin cannot join contest", res.status === 403);

    // 3. User Permissions Test
    console.log("\n3. Testing User Permissions");

    // User cannot create contest
    res = await request("POST", "/api/admin/contests", contestData, userToken);
    assert("User cannot create contest (403)", res.status === 403);

    // User cannot update contest
    res = await request("PUT", `/api/admin/contests/${contestId}`, { title: "Hacked Title" }, userToken);
    assert("User cannot update contest (403)", res.status === 403);

    // User cannot join before registering
    res = await request("POST", `/api/contests/${contestId}/join`, {}, userToken);
    assert("User cannot join without registration", res.status === 403);

    // User registers
    res = await request("POST", `/api/contests/${contestId}/register`, {}, userToken);
    assert("User can register successfully", res.status === 201 && res.data.registration);

    // User cannot join before contest starts
    res = await request("POST", `/api/contests/${contestId}/join`, {}, userToken);
    assert("User cannot join before contest starts", res.status === 400);

    // Wait for contest to start
    console.log("  Waiting 5 seconds for contest to start...");
    await sleep(5000);

    // User joins
    res = await request("POST", `/api/contests/${contestId}/join`, {}, userToken);
    assert("User can join after contest starts", res.status === 200);

    // 4. Submission & Scoring Test
    console.log("\n4. Testing Contest Submissions");

    // Admin cannot submit contest solution
    res = await request("POST", "/api/submission/submit", {
        problemId,
        language: "python",
        code: "print('admin try')",
        contestId
    }, adminToken);
    assert("Admin cannot submit contest solution", res.status === 403);

    // User submits incorrect solution
    res = await request("POST", "/api/submission/submit", {
        problemId,
        language: "python",
        code: "print('wrong answer')",
        contestId
    }, userToken);
    assert("User can submit contest solution", res.status === 201 && res.data.submission?._id);
    const subId = res.data.submission._id;

    // Wait for evaluation
    console.log("  Waiting for evaluation to finish...");
    let verdict = "PENDING";
    for (let i = 0; i < 15; i++) {
        await sleep(500);
        const subCheck = await ContestSubmission.findOne({ submissionId: subId });
        if (subCheck && subCheck.verdict !== "PENDING") {
            verdict = subCheck.verdict;
            break;
        }
    }
    assert("Submission verdict is processed", verdict === "WRONG_ANSWER" || verdict === "ACCEPTED", `got ${verdict}`);

    // Fetch Leaderboard
    res = await request("GET", `/api/contests/${contestId}/leaderboard`, null, userToken);
    assert("Get contest leaderboard", res.status === 200 && Array.isArray(res.data.leaderboard));

    // Admin can view participants
    res = await request("GET", `/api/admin/contests/${contestId}/participants`, null, adminToken);
    assert("Admin can view participants list", res.status === 200 && res.data.participants.length > 0);

    // User cannot view participants
    res = await request("GET", `/api/admin/contests/${contestId}/participants`, null, userToken);
    assert("User cannot view participants list", res.status === 403);

    // Admin delete contest
    res = await request("DELETE", `/api/admin/contests/${contestId}`, null, adminToken);
    assert("Admin can delete contest", res.status === 200);

    // Clean up users
    await User.findByIdAndDelete(adminId);
    await User.findByIdAndDelete(userId);
    console.log("\nCleaned up test accounts.");

    // Disconnect DB
    await mongoose.disconnect();

    // Summary
    console.log(`\n=== Contest Results: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) process.exit(1);
    process.exit(0);
}

runTests().catch((err) => {
    console.error("Test execution crashed:", err);
    process.exit(1);
});
