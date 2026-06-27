const Submission = require("../model/submission");
const AIAnalysis = require("../model/aiAnalysis");
const Problem = require("../model/problem");
const Contest = require("../model/contest");
const ContestRegistration = require("../model/contestRegistration");
const ContestSubmission = require("../model/contestSubmission");
const storage = require("../services/storage");
const { evaluateSubmission } = require("../services/evaluationService");

const getSubmissions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) {
            filter.userId = req.query.userId;
        }
        if (req.query.problemId) {
            filter.problemId = req.query.problemId;
        }

        const submissions = await Submission.find(filter)
            .populate("problemId", "title difficulty")
            .populate("userId", "firstName lastName email")
            .sort({ submittedAt: -1 })
            .limit(parseInt(req.query.limit, 10) || 100);

        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissions
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id)
            .populate("problemId", "title difficulty")
            .populate("userId", "firstName lastName email");

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        const aiAnalysis = await AIAnalysis.findOne({ submissionId: id });

        let code = submission.code;
        if (!code && submission.codeFilePath) {
            try {
                code = await storage.getObject(submission.codeFilePath);
            } catch {
                code = "";
            }
        }

        return res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission: { ...submission.toObject(), code },
            aiAnalysis
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createSubmission = async (req, res) => {
    try {
        const { problemId, language, code, contestId } = req.body;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        if (contestId) {
            if (req.userRole === "ADMIN") {
                return res.status(403).json({ success: false, message: "Admins cannot submit contest solutions" });
            }

            const contest = await Contest.findById(contestId);
            if (!contest) {
                return res.status(404).json({ success: false, message: "Contest not found" });
            }

            const registration = await ContestRegistration.findOne({ contestId, userId: req.userId });
            if (!registration) {
                return res.status(403).json({ success: false, message: "You must register for the contest before submitting solutions" });
            }

            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            if (now < start || now > end) {
                return res.status(400).json({ success: false, message: "Contest is not active" });
            }
        }

        const extension = language === "cpp" ? "cpp" : language === "java" ? "java" : language === "javascript" ? "js" : "py";
        const codeFilePath = `submissions/${req.userId}/${problemId}_${Date.now()}.${extension}`;

        await storage.putObject(codeFilePath, Buffer.from(code || ""));

        const submission = await Submission.create({
            userId: req.userId,
            problemId,
            contestId: contestId || undefined,
            language,
            code,
            codeFilePath,
            verdict: "PENDING"
        });

        if (contestId) {
            await ContestSubmission.create({
                contestId,
                userId: req.userId,
                problemId,
                submissionId: submission._id,
                score: 0,
                verdict: "PENDING"
            });
        }

        setImmediate(() => {
            evaluateSubmission(submission._id, language, code || "")
                .catch((err) => console.error("Background evaluation error:", err));
        });

        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            submission
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSubmissions, getSubmissionById, createSubmission };
