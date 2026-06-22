const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"], trim: true },
    statement: { type: String, required: [true, "Statement is required"] },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: [true, "Difficulty is required"] },
    timeLimitMillis: { type: Number, required: [true, "Time limit is required"] },
    memoryLimitMBs: { type: Number, required: [true, "Memory limit is required"] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Problem", problemSchema);