const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission",
        required: true,
        unique: true
    },
    complexity: {
        time: { type: String, default: "Unknown" },
        space: { type: String, default: "Unknown" }
    },
    codeQuality: { type: String, default: "" },
    codingStyle: { type: String, default: "" },
    issues: [{ type: String }],
    suggestions: [{ type: String }],
    potentialBugs: [{ type: String }],
    edgeCasesMissed: [{ type: String }],
    rawAnalysis: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AIAnalysis", aiAnalysisSchema);
