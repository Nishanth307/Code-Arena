const mongoose = require("mongoose");

const aiAnalysisLimitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
});

aiAnalysisLimitSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AIAnalysisLimit", aiAnalysisLimitSchema);
