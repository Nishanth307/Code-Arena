const express = require("express");
const { getSubmissions, getSubmissionById, createSubmission, getSubmissionsByUserId } = require("../controller/submissionController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { submissionLimiter } = require("../middleware/rateLimiter");
const { validateSubmissionPayload } = require("../middleware/validatePayload");

const submissionRouter = express.Router();

submissionRouter.get("/", authMiddleware, asyncHandler(getSubmissionsByUserId));
submissionRouter.get("/:id", asyncHandler(getSubmissionById));
submissionRouter.post("/submit", authMiddleware, submissionLimiter, validateSubmissionPayload, asyncHandler(createSubmission));

module.exports = submissionRouter;
