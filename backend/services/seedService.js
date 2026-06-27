const mongoose = require("mongoose");
const Problem = require("../model/problem");
const TestCase = require("../model/testCase");
const Contest = require("../model/contest");
const storage = require("./storage");

const seedProblems = [
    {
        title: "Two Sum",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "EASY",
        timeLimitMillis: 1000,
        memoryLimitMBs: 256,
        inputFormat: "First line contains N (size of array).\nSecond line contains N space-separated integers.\nThird line contains the target sum.\n\nExample code:\nn = int(input())\narr = list(map(int, input().split()))\ntarget = int(input())",
        constraints: "2 ≤ N ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ Target ≤ 10⁹\nOnly one valid answer exists.",
        outputFormat: "Print two space-separated integers on a single line representing the indices of the two numbers.",
        testCases: [
            {
                input: "4\n2 7 11 15\n9",
                expectedOutput: "0 1",
                explanation: "Because nums[0] + nums[1] == 9, we return 0 1.",
                isHidden: false
            },
            {
                input: "2\n3 3\n6",
                expectedOutput: "0 1",
                explanation: "nums[0] + nums[1] == 6.",
                isHidden: true
            }
        ]
    },
    {
        title: "Add Two Numbers",
        statement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        difficulty: "MEDIUM",
        timeLimitMillis: 2000,
        memoryLimitMBs: 256,
        inputFormat: "First line: N1 followed by N1 space-separated integers (first list).\nSecond line: N2 followed by N2 space-separated integers (second list).\n\nExample code:\nparts1 = list(map(int, input().split()))\nn1, *list1 = parts1\nparts2 = list(map(int, input().split()))\nn2, *list2 = parts2",
        constraints: "1 ≤ N1, N2 ≤ 100\n0 ≤ node.val ≤ 9",
        outputFormat: "Print the sum list elements space-separated on a single line.",
        testCases: [
            {
                input: "3\n2 4 3\n3\n5 6 4",
                expectedOutput: "7 0 8",
                explanation: "342 + 465 = 807.",
                isHidden: false
            }
        ]
    },
    {
        title: "Median of Two Sorted Arrays",
        statement: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        difficulty: "HARD",
        timeLimitMillis: 3000,
        memoryLimitMBs: 256,
        inputFormat: "First line: M followed by M space-separated integers.\nSecond line: N followed by N space-separated integers.\n\nExample code:\nparts1 = list(map(int, input().split()))\nm, *nums1 = parts1\nparts2 = list(map(int, input().split()))\nn, *nums2 = parts2",
        constraints: "0 ≤ M, N ≤ 1000\n1 ≤ M + N ≤ 2000",
        outputFormat: "Print a single floating-point number representing the median with exactly 5 decimal places.",
        testCases: [
            {
                input: "2\n1 3\n1\n2",
                expectedOutput: "2.00000",
                explanation: "merged array = [1,2,3] and median is 2.0.",
                isHidden: false
            }
        ]
    }
];

const syncTestCases = async (problemId, testCasesList) => {
    for (let i = 0; i < testCasesList.length; i++) {
        const tc = testCasesList[i];
        const timestamp = Date.now() + "_" + i;
        const inputPath = `testcases/${problemId}/input_${timestamp}.txt`;
        const outputPath = `testcases/${problemId}/output_${timestamp}.txt`;

        await storage.putObject(inputPath, Buffer.from(tc.input || ""));
        await storage.putObject(outputPath, Buffer.from(tc.expectedOutput || ""));

        await TestCase.create({
            problemId,
            inputPath,
            outputPath,
            isHidden: tc.isHidden || false
        });
    }
};

const seedContests = async (problemIds) => {
    const now = Date.now();
    const contests = [
        {
            title: "Weekly Coding Challenge",
            description: "A weekly contest featuring array and linked-list problems. Solve as many as you can before time runs out!",
            startTime: new Date(now - 24 * 60 * 60 * 1000),
            endTime: new Date(now + 7 * 24 * 60 * 60 * 1000),
            problems: problemIds.slice(0, 2),
            status: "LIVE",
            participantCount: 0,
            duration: 11520
        },
        {
            title: "Algorithm Mastery Series",
            description: "Advanced algorithmic challenges for experienced coders. Includes hard problems on binary search and optimization.",
            startTime: new Date(now + 3 * 24 * 60 * 60 * 1000),
            endTime: new Date(now + 10 * 24 * 60 * 60 * 1000),
            problems: problemIds,
            status: "UPCOMING",
            participantCount: 0,
            duration: 10080
        },
        {
            title: "Beginner Practice Round",
            description: "Perfect for newcomers! Warm up with easy problems and build your coding confidence.",
            startTime: new Date(now - 14 * 24 * 60 * 60 * 1000),
            endTime: new Date(now - 7 * 24 * 60 * 60 * 1000),
            problems: [problemIds[0]],
            status: "ENDED",
            participantCount: 42,
            duration: 10080
        }
    ];

    for (const contestData of contests) {
        await Contest.create(contestData);
        console.log(`Seeded contest: ${contestData.title}`);
    }
};

const ensureSeedData = async () => {
    const problemCount = await Problem.countDocuments();
    if (problemCount > 0) {
        const contestCount = await Contest.countDocuments();
        if (contestCount === 0) {
            const problems = await Problem.find().select("_id");
            await seedContests(problems.map((p) => p._id));
            console.log("Seeded contests for existing problems.");
        } else {
            console.log(`Seed skipped: ${problemCount} problems, ${contestCount} contests already exist.`);
        }
        return;
    }

    console.log("Database empty — seeding initial problems and contests...");

    const problemIds = [];
    for (const problemInfo of seedProblems) {
        const problem = await Problem.create(problemInfo);
        problemIds.push(problem._id);
        console.log(`Seeded problem: ${problem.title}`);

        if (problemInfo.testCases?.length) {
            await syncTestCases(problem._id, problemInfo.testCases);
            console.log(`Seeded test cases for: ${problem.title}`);
        }
    }

    await seedContests(problemIds);
    console.log("Initial seed data loaded successfully.");
};

module.exports = { ensureSeedData, seedProblems };
