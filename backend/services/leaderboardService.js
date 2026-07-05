const Submission = require("../model/submission");
const Problem = require("../model/problem");
const User = require("../model/user");
const DIFFICULTY_POINTS = { EASY: 10, MEDIUM: 30, HARD: 50 };

const calculateUserStats = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) return null;

    const submissions = await Submission.find({ userId }).populate("problemId", "title difficulty");
    const problems = await Problem.find({}, "difficulty");

    const problemDifficultyMap = {};
    problems.forEach((p) => {
        problemDifficultyMap[p._id.toString()] = p.difficulty;
    });

    const acceptedSubmissions = submissions.filter((s) => s.verdict === "ACCEPTED");
    const solvedProblemIds = new Set();
    const firstAcceptedByProblem = {};

    acceptedSubmissions.forEach((s) => {
        const pid = s.problemId?._id?.toString() || s.problemId?.toString();
        if (!pid) return;
        if (!firstAcceptedByProblem[pid] || new Date(s.submittedAt) < new Date(firstAcceptedByProblem[pid].submittedAt)) {
            firstAcceptedByProblem[pid] = s;
        }
        solvedProblemIds.add(pid);
    });

    let totalScore = 0;
    let performanceBonus = 0;

    Object.values(firstAcceptedByProblem).forEach((s) => {
        const diff = s.problemId?.difficulty || problemDifficultyMap[s.problemId?.toString()] || "EASY";
        totalScore += DIFFICULTY_POINTS[diff] || 10;

        if (s.executionTime && s.executionTime < 500) {
            performanceBonus += 2;
        } else if (s.executionTime && s.executionTime < 1000) {
            performanceBonus += 1;
        }
    });

    totalScore += performanceBonus;

    const totalSubmissions = submissions.length;
    const acceptedCount = acceptedSubmissions.length;
    const successRate = totalSubmissions > 0
        ? Math.round((acceptedCount / totalSubmissions) * 100)
        : 0;

    const easySolved = Object.values(firstAcceptedByProblem).filter(
        (s) => (s.problemId?.difficulty || problemDifficultyMap[s.problemId?.toString()]) === "EASY"
    ).length;
    const mediumSolved = Object.values(firstAcceptedByProblem).filter(
        (s) => (s.problemId?.difficulty || problemDifficultyMap[s.problemId?.toString()]) === "MEDIUM"
    ).length;
    const hardSolved = Object.values(firstAcceptedByProblem).filter(
        (s) => (s.problemId?.difficulty || problemDifficultyMap[s.problemId?.toString()]) === "HARD"
    ).length;

    const avgExecutionTime = acceptedCount > 0
        ? Math.round(acceptedSubmissions.reduce((sum, s) => sum + (s.executionTime || 0), 0) / acceptedCount)
        : 0;

    return {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        totalScore,
        problemsSolved: solvedProblemIds.size,
        acceptedSubmissions: acceptedCount,
        totalSubmissions,
        successRate,
        avgExecutionTime,
        performanceBonus,
        breakdown: { easy: easySolved, medium: mediumSolved, hard: hardSolved }
    };
};

const getLeaderboard = async (limit = 50) => {
    const users = await User.find({ role: "USER" }).select("-password");
    const allStats = await Promise.all(users.map((u) => calculateUserStats(u._id)));

    const ranked = allStats
        .filter(Boolean)
        .sort((a, b) => {
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
            if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
            if (b.successRate !== a.successRate) return b.successRate - a.successRate;
            return a.avgExecutionTime - b.avgExecutionTime;
        })
        .slice(0, limit)
        .map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

    return ranked;
};

const getUserRank = async (userId) => {
    const fullBoard = await getLeaderboard(1000);
    const userEntry = fullBoard.find((e) => e.userId.toString() === userId.toString());
    if (!userEntry) {
        const stats = await calculateUserStats(userId);
        if (!stats) return null;
        return { rank: null, ...stats };
    }
    return userEntry;
};

module.exports = { getLeaderboard, getUserRank, calculateUserStats };
