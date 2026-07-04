const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    token_hash: {
        type: String,
        required: [true, "Verification code is required"],
        maxlength: 6,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000),
    }
});

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);
module.exports = EmailVerification;