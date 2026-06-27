const express = require("express");
const {
    createContest,
    updateContest,
    deleteContest,
    getContestParticipants
} = require("../controller/contestController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const adminContestRouter = express.Router();

adminContestRouter.use(authMiddleware);
adminContestRouter.use(roleMiddleware(["ADMIN"]));

adminContestRouter.post("/", asyncHandler(createContest));
adminContestRouter.put("/:id", asyncHandler(updateContest));
adminContestRouter.delete("/:id", asyncHandler(deleteContest));
adminContestRouter.get("/:id/participants", asyncHandler(getContestParticipants));

module.exports = adminContestRouter;
