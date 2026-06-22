const express = require("express")
const { getContests, getContestById, createContest, updateContest, deleteContest } = require("../controller/contestController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const contestRouter = express.Router();

contestRouter.get("/", asyncHandler(getContests));
contestRouter.get("/:id", asyncHandler(getContestById));
contestRouter.post("/create", authMiddleware, adminMiddleware, asyncHandler(createContest));
contestRouter.put("/update/:id", authMiddleware, adminMiddleware, asyncHandler(updateContest));
contestRouter.delete("/delete/:id", authMiddleware, adminMiddleware, asyncHandler(deleteContest));

module.exports = contestRouter;