const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"]},
    problemId: {type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: [true, "Problem ID is required"]},
    contestId: {type: mongoose.Schema.Types.ObjectId, ref: "Contest"},
    language: {type: String, required: [true, "Language is required"], trim: true, enum: ["cpp","python","java","javascript", "golang"]},
    codeFilePath: {type: String, required: [true, "Code file path is required"], trim: true},
    verdict: {type: String, trim: true, enum: ["PENDING", "ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR", "COMPILATION_ERROR"], default:"PENDING"},
    executionTime: {type: Number},
    memoryUsed: {type: Number},
    logMinIOPath: {type: String, trim: true},
    testCaseResults: [
        {
            testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: "TestCase" },
            inputPath: { type: String },
            expectedOutputPath: { type: String },
            userOutput: { type: String },
            status: { type: String, enum: ["ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR", "COMPILATION_ERROR", "TIME_LIMIT_EXCEEDED"] },
            executionTime: { type: Number },
            error: { type: String }
        }
    ],
    submittedAt: {type: Date, default: Date.now},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
})

module.exports = mongoose.model("Submission", submissionSchema);