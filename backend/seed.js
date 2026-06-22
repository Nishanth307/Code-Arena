const mongoose = require("mongoose");
const Problem = require("./model/problem");
const settings = require("./config/settings");

const seedData = [
    {
        title: "Two Sum",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "EASY",
        timeLimitMillis: 1000,
        memoryLimitMBs: 256
    },
    {
        title: "Add Two Numbers",
        statement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        difficulty: "MEDIUM",
        timeLimitMillis: 2000,
        memoryLimitMBs: 256
    },
    {
        title: "Median of Two Sorted Arrays",
        statement: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
        difficulty: "HARD",
        timeLimitMillis: 3000,
        memoryLimitMBs: 256
    }
];

async function seed() {
    try {
        await mongoose.connect(settings.MONGODB_URI);
        console.log("Connected to MongoDB for seeding");

        // Clear existing problems
        await Problem.deleteMany({});
        console.log("Cleared existing problems");

        // Insert new problems
        await Problem.insertMany(seedData);
        console.log("Database seeded successfully with 3 problems!");

        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seed();
