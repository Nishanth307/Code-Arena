const mongoose = require("mongoose");
const Problem = require("./model/problem");
const TestCase = require("./model/testCase");
const settings = require("./config/settings");
const storage = require("./services/storage");

const seedData = [
    {
        title: "Two Sum",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "EASY",
        timeLimitMillis: 1000,
        memoryLimitMBs: 256,
        inputFormat: "One integer N on the first line representing the size of the array.\nN integers on the second line representing the array elements. The i-th integer represents nums[i].\nOne integer Target on the third line representing the target sum.",
        constraints: "2 ≤ N ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ Target ≤ 10⁹\nOnly one valid answer exists.",
        outputFormat: "Print two space-separated integers on a single line representing the indices of the two numbers.",
        testCases: [
            {
                input: "4\n2 7 11 15\n9",
                expectedOutput: "0 1",
                explanation: "Because nums[0] + nums[1] == 9, we return 0 1.",
                isHidden: false
            }
        ]
    },
    {
        title: "Add Two Numbers",
        statement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        difficulty: "MEDIUM",
        timeLimitMillis: 2000,
        memoryLimitMBs: 256,
        inputFormat: "The first line contains an integer N1 representing the size of the first list, followed by N1 space-separated integers representing its elements.\nThe second line contains an integer N2 representing the size of the second list, followed by N2 space-separated integers representing its elements.",
        constraints: "1 ≤ N1, N2 ≤ 100\n0 ≤ node.val ≤ 9\nIt is guaranteed that the list represents a number that does not have leading zeros.",
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
        statement: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
        difficulty: "HARD",
        timeLimitMillis: 3000,
        memoryLimitMBs: 256,
        inputFormat: "The first line contains an integer M representing the size of the first array, followed by M space-separated integers representing its elements.\nThe second line contains an integer N representing the size of the second array, followed by N space-separated integers representing its elements.",
        constraints: "0 ≤ M, N ≤ 1000\n1 ≤ M + N ≤ 2000\n-10⁶ ≤ nums1[i], nums2[j] ≤ 10⁶",
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

async function seed() {
    try {
        await mongoose.connect(settings.MONGODB_URI);
        console.log("Connected to MongoDB for seeding");

        // Clear existing problems and test cases
        await Problem.deleteMany({});
        await TestCase.deleteMany({});
        console.log("Cleared existing problems and test cases");

        for (let problemInfo of seedData) {
            const problem = await Problem.create(problemInfo);
            console.log(`Created problem: ${problem.title}`);

            if (problemInfo.testCases) {
                for (let i = 0; i < problemInfo.testCases.length; i++) {
                    const tc = problemInfo.testCases[i];
                    const timestamp = Date.now() + "_" + i;
                    const inputPath = `testcases/${problem._id}/input_${timestamp}.txt`;
                    const outputPath = `testcases/${problem._id}/output_${timestamp}.txt`;

                    // Upload to storage adapter
                    await storage.putObject(inputPath, Buffer.from(tc.input));
                    await storage.putObject(outputPath, Buffer.from(tc.expectedOutput));

                    // Create TestCase document
                    await TestCase.create({
                        problemId: problem._id,
                        inputPath,
                        outputPath,
                        isHidden: tc.isHidden || false
                    });
                }
                console.log(`Seeded test cases for problem: ${problem.title}`);
            }
        }

        console.log("Database and MinIO seeded successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seed();
