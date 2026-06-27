const express = require("express");
const { getGlobalLeaderboard, getUserLeaderboardEntry } = require("../controller/leaderboardController");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getGlobalLeaderboard));
router.get("/user/:id", asyncHandler(getUserLeaderboardEntry));

module.exports = router;
