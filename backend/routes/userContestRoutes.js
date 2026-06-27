const express = require("express");
const {
    getContests,
    getContestById,
    registerForContest,
    joinContest,
    getContestLeaderboard
} = require("../controller/contestController");
const authMiddleware = require("../middleware/authMiddleware");
const { optionalAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const userContestRouter = express.Router();

// Allow optional auth for viewing contests/leaderboards, but require auth for register/join
userContestRouter.get("/", optionalAuth, asyncHandler(getContests));
userContestRouter.get("/:id", optionalAuth, asyncHandler(getContestById));
userContestRouter.post("/:id/register", authMiddleware, asyncHandler(registerForContest));
userContestRouter.post("/:id/join", authMiddleware, asyncHandler(joinContest));
userContestRouter.get("/:id/leaderboard", optionalAuth, asyncHandler(getContestLeaderboard));

module.exports = userContestRouter;
