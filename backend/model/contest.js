const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"], trim: true, unique: true },
    description: { type: String },
    startTime: { type: Date, required: [true, "Start time is required"] },
    endTime: { type: Date, required: [true, "End time is required"] },
    problems: { type: [mongoose.Schema.Types.ObjectId], ref: "Problem" },
    status: { type: String, enum: ["UPCOMING", "LIVE", "ENDED"], default: "UPCOMING" },
    participantCount: { type: Number, required: true, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    duration: { type: Number, required: [true, "Duration is required"] },
    visibility: { type: String, enum: ["PUBLIC", "PRIVATE"], default: "PUBLIC" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

contestSchema.pre("validate", function() {
    if (!this.duration && this.startTime && this.endTime) {
        this.duration = Math.round((new Date(this.endTime) - new Date(this.startTime)) / (1000 * 60));
    }
    if (!this.duration) {
        this.duration = 60; // default fallback
    }
});

module.exports = mongoose.model("Contest", contestSchema);