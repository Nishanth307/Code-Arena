const express = require("express")
const { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } = require("../controller/problemController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const problemRouter = express.Router();

problemRouter.get("/", asyncHandler(getProblems));
problemRouter.get("/:id", asyncHandler(getProblemById));
problemRouter.post("/create", authMiddleware, adminMiddleware, asyncHandler(createProblem));
problemRouter.put("/update/:id", authMiddleware, adminMiddleware, asyncHandler(updateProblem));
problemRouter.delete("/delete/:id", authMiddleware, adminMiddleware, asyncHandler(deleteProblem));

module.exports = problemRouter;