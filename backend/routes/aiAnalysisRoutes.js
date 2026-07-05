const express = require("express");
const { createAiAnalysis, getAiLimit } = require("../controller/aiAnalysisController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// Protect all AI-powered analysis endpoints with authentication
router.use(authMiddleware);

router.post("/:submissionId/ai-analysis", asyncHandler(createAiAnalysis));
router.get("/:submissionId/ai-limit", asyncHandler(getAiLimit));

module.exports = router;
