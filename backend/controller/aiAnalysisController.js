const Submission = require("../model/submission");
const Problem = require("../model/problem");
const storage = require("../services/storage");
const { generatePrompt } = require("../services/promptService");
const { generateAIAnalysis } = require("../services/geminiService");
const { getRemainingQuota, checkAndIncrementQuota, getDailyLimit } = require("../services/rateLimitService");

const createAiAnalysis = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;

        if (!submissionId) {
            return res.status(400).json({ success: false, message: "Submission ID is required" });
        }

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        const isOwner = String(submission.userId) === String(userId);
        const isAdmin = userRole?.toUpperCase() === "ADMIN";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Access denied: you do not own this submission" });
        }

        if (submission.verdict === "PENDING") {
            return res.status(400).json({ success: false, message: "Submission is still being evaluated. Please wait." });
        }

        const limitMax = getDailyLimit();
        const quotaAvailable = await checkAndIncrementQuota(userId);
        if (!quotaAvailable) {
            return res.status(429).json({
                success: false,
                message: `Daily AI Analysis limit reached (${limitMax}/${limitMax}). Please try again tomorrow.`
            });
        }

        let code = submission.code;
        if (!code && submission.codeFilePath) {
            try {
                code = await storage.getObject(submission.codeFilePath);
            } catch (err) {
                code = "";
            }
        }

        const problem = await Problem.findById(submission.problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const promptText = generatePrompt(problem, code, submission.language, submission);
        let analysisData;
        try {
            analysisData = await generateAIAnalysis(promptText);
        } catch (apiError) {
            console.error("AI generation failed with error:", apiError);
            const todayStr = new Date().toISOString().split("T")[0];
            const AIAnalysisLimit = require("../model/aiAnalysisLimit");
            await AIAnalysisLimit.updateOne(
                { userId, date: todayStr },
                { $inc: { count: -1 } }
            );

            return res.status(502).json({
                success: false,
                message: "Failed to generate AI analysis. The AI service is currently busy or unavailable. Please try again later."
            });
        }

        const analysis = {
            complexity: {
                time: analysisData.timeComplexity || "Unknown",
                space: analysisData.spaceComplexity || "Unknown"
            },
            overallScore: analysisData.overallScore,
            summary: analysisData.summary,
            optimal: analysisData.optimal || false,
            strengths: analysisData.strengths || [],
            improvements: analysisData.improvements || [],
            potentialIssues: analysisData.potentialIssues || [],
            interviewTip: analysisData.interviewTip || ""
        };

        return res.status(200).json({
            success: true,
            message: "AI Analysis generated successfully",
            analysis
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAiLimit = async (req, res) => {
    try {
        const userId = req.userId;
        const limitMax = getDailyLimit();
        const remaining = await getRemainingQuota(userId);
        
        return res.status(200).json({
            success: true,
            limit: limitMax,
            remaining
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAiAnalysis,
    getAiLimit
};
