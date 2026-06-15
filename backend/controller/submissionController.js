const Submission = require("../model/submission");
const { sendSubmissionJob } = require("../services/kafka/producer");

const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find();
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
        const submission = await Submission.create(req.body);
        
        // Enqueue the evaluation job to Kafka
        await sendSubmissionJob({
            submissionId: submission._id,
            language: submission.language,
            code: req.body.code || "",
            input: req.body.input || ""
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
