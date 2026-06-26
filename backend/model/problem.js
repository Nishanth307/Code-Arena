const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"], trim: true },
    statement: { type: String, required: [true, "Statement is required"] },
    description: { type: String, default: "" },
    constraints: { type: String, default: "" },
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: [true, "Difficulty is required"] },
    timeLimitMillis: { type: Number, required: [true, "Time limit is required"] },
    memoryLimitMBs: { type: Number, required: [true, "Memory limit is required"] },
    testCases: [
        {
            input: { type: String, default: "" },
            expectedOutput: { type: String, default: "" },
            explanation: { type: String, default: "" },
            isHidden: { type: Boolean, default: false }
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

problemSchema.pre("validate", function() {
    if (!this.statement && this.description) {
        this.statement = this.description;
    }
    if (!this.description && this.statement) {
        this.description = this.statement;
    }
});

module.exports = mongoose.model("Problem", problemSchema);