const mongoose = require("mongoose");

const contestSubmissionSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    score: { type: Number, default: 0 },
    verdict: { type: String, required: true }
});

module.exports = mongoose.model("ContestSubmission", contestSubmissionSchema);
