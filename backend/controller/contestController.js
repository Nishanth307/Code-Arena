const Contest = require("../model/contest");
const ContestRegistration = require("../model/contestRegistration");
const ContestSubmission = require("../model/contestSubmission");
const User = require("../model/user");
const Problem = require("../model/problem");

// Admin APIs

const createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, duration, problems, visibility } = req.body;
        
        let calculatedDuration = duration;
        if (!calculatedDuration && startTime && endTime) {
            calculatedDuration = Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60));
        }

        // Admins cannot register/join/participate, and createdBy links to the admin user
        const contest = await Contest.create({
            title,
            description,
            startTime,
            endTime,
            duration: calculatedDuration || 60,
            problems: problems || [],
            visibility: visibility || "PUBLIC",
            createdBy: req.userId
        });

        return res.status(201).json({
            success: true,
            message: "Contest created successfully",
            contest
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateContest = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findByIdAndUpdate(id, req.body, { new: true }).populate("problems");
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Contest updated successfully",
            contest
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteContest = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findByIdAndDelete(id);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }
        // Clean up registrations and submissions for this contest
        await ContestRegistration.deleteMany({ contestId: id });
        await ContestSubmission.deleteMany({ contestId: id });

        return res.status(200).json({
            success: true,
            message: "Contest deleted successfully",
            contest
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getContestParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const registrations = await ContestRegistration.find({ contestId: id }).populate("userId", "firstName lastName email role");
        return res.status(200).json({
            success: true,
            message: "Contest participants fetched successfully",
            participants: registrations.map(r => r.userId).filter(Boolean)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// User / Common APIs

const getContests = async (req, res) => {
    try {
        // Users can view available contests
        const contests = await Contest.find({ visibility: "PUBLIC" }).populate("problems");
        return res.status(200).json({
            success: true,
            message: "Contests fetched successfully",
            contests
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getContestById = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id).populate("problems");
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        // Check if current user is registered
        let isRegistered = false;
        if (req.userId) {
            const registration = await ContestRegistration.findOne({ contestId: id, userId: req.userId });
            if (registration) {
                isRegistered = true;
            }
        }

        const contestObj = contest.toObject();

        // Enforce visibility / problem access rules
        const now = new Date();
        const start = new Date(contest.startTime);
        
        // Non-admin users cannot see problems if the contest has not started yet
        if (req.userRole !== "ADMIN" && now < start) {
            contestObj.problems = [];
        }

        return res.status(200).json({
            success: true,
            message: "Contest fetched successfully",
            contest: contestObj,
            isRegistered
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const registerForContest = async (req, res) => {
    try {
        const { id } = req.params;

        // Admin cannot register
        if (req.userRole === "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admins cannot register for contests"
            });
        }

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        // Validate: registration is open (i.e. contest has not ended yet)
        const now = new Date();
        const end = new Date(contest.endTime);
        if (now > end) {
            return res.status(400).json({
                success: false,
                message: "Contest registration is closed as the contest has already ended"
            });
        }

        // Validate: user not already registered
        const existingReg = await ContestRegistration.findOne({ contestId: id, userId: req.userId });
        if (existingReg) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this contest"
            });
        }

        const registration = await ContestRegistration.create({
            contestId: id,
            userId: req.userId,
            registeredAt: new Date(),
            status: "REGISTERED"
        });

        // Increment participant count
        contest.participantCount = (contest.participantCount || 0) + 1;
        await contest.save();

        return res.status(201).json({
            success: true,
            message: "Successfully registered for the contest",
            registration
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const joinContest = async (req, res) => {
    try {
        const { id } = req.params;

        // Admin cannot join
        if (req.userRole === "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admins cannot join contests"
            });
        }

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        // Validate: user is registered
        const registration = await ContestRegistration.findOne({ contestId: id, userId: req.userId });
        if (!registration) {
            return res.status(403).json({
                success: false,
                message: "You must register for the contest before joining"
            });
        }

        // Validate: contest is active (during duration)
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);
        if (now < start) {
            return res.status(400).json({
                success: false,
                message: "Contest has not started yet"
            });
        }
        if (now > end) {
            return res.status(400).json({
                success: false,
                message: "Contest has already ended"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully joined the contest",
            contest
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getContestLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        const registrations = await ContestRegistration.find({ contestId: id }).populate("userId", "firstName lastName email");
        const submissions = await ContestSubmission.find({ contestId: id });

        const DIFFICULTY_POINTS = { EASY: 10, MEDIUM: 30, HARD: 50 };

        const leaderboard = await Promise.all(registrations.map(async (reg) => {
            const userSubmissions = submissions.filter(s => s.userId.toString() === reg.userId._id.toString());
            
            // Get all unique problems solved by the user with ACCEPTED status
            const solvedProblems = new Set();
            let score = 0;
            let lastAcceptedAt = null;

            // Fetch detail for each accepted submission to get submittedAt for tie-break
            for (const sub of userSubmissions) {
                if (sub.verdict === "ACCEPTED") {
                    const originalSub = await Submission.findById(sub.submissionId);
                    if (originalSub) {
                        const pid = sub.problemId.toString();
                        if (!solvedProblems.has(pid)) {
                            solvedProblems.add(pid);
                            const problem = await Problem.findById(sub.problemId);
                            const points = problem ? (DIFFICULTY_POINTS[problem.difficulty] || 10) : 10;
                            score += points;

                            const subTime = new Date(originalSub.submittedAt);
                            if (!lastAcceptedAt || subTime > lastAcceptedAt) {
                                lastAcceptedAt = subTime;
                            }
                        }
                    }
                }
            }

            return {
                userId: reg.userId._id,
                firstName: reg.userId.firstName,
                lastName: reg.userId.lastName,
                email: reg.userId.email,
                score,
                problemsSolved: solvedProblems.size,
                lastAcceptedAt
            };
        }));

        // Sort leaderboard: score desc, problemsSolved desc, lastAcceptedAt asc (earlier is better)
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
            if (a.lastAcceptedAt && b.lastAcceptedAt) {
                return new Date(a.lastAcceptedAt) - new Date(b.lastAcceptedAt);
            }
            if (a.lastAcceptedAt) return -1;
            if (b.lastAcceptedAt) return 1;
            return 0;
        });

        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        return res.status(200).json({
            success: true,
            message: "Contest leaderboard fetched successfully",
            leaderboard: rankedLeaderboard
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createContest,
    updateContest,
    deleteContest,
    getContestParticipants,
    getContests,
    getContestById,
    registerForContest,
    joinContest,
    getContestLeaderboard
};