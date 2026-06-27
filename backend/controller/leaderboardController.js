const { getLeaderboard, getUserRank } = require("../services/leaderboardService");

const getGlobalLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 50;
        const leaderboard = await getLeaderboard(limit);
        return res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            leaderboard
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getUserLeaderboardEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await getUserRank(id);
        if (!entry) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            message: "User ranking fetched successfully",
            entry
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getGlobalLeaderboard, getUserLeaderboardEntry };
