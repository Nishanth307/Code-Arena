const mongoose = require("mongoose");

const contestRegistrationSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["REGISTERED", "UNREGISTERED"], default: "REGISTERED" }
});

// Ensure a user can only register once per contest
contestRegistrationSchema.index({ contestId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("ContestRegistration", contestRegistrationSchema);
