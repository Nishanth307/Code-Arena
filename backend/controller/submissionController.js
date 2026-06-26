const Submission = require("../model/submission");
const { evaluateSubmission } = require("../services/evaluationService");

const getSubmissions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) {
            filter.userId = req.query.userId;
        }
        const submissions = await Submission.find(filter)
            .populate("problemId", "title")
            .sort({ submittedAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissions: submissions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission: submission
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createSubmission = async (req, res) => {
    try {
        req.body.userId = req.userId;
        
        // Ensure codeFilePath is populated for schema compliance
        const extension = req.body.language === "cpp" ? "cpp" : req.body.language === "java" ? "java" : req.body.language === "javascript" ? "js" : "py";
        req.body.codeFilePath = req.body.codeFilePath || `submissions/${Date.now()}_${req.userId || "guest"}.${extension}`;

        const submission = await Submission.create(req.body);
        
        // Asynchronously evaluate the submission in the background
        setImmediate(() => {
            evaluateSubmission(submission._id, submission.language, req.body.code || "")
                .catch((err) => console.error("Background evaluation error:", err));
        });

        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            submission: submission
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getSubmissions, getSubmissionById, createSubmission };
