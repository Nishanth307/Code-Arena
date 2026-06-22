const express = require ("express");
const TestCase = require("../model/testCase");
const asyncHandler = require("../middleware/asyncHandler");
const { createTestCase, getTestCasesByProblemId } = require("../controller/testCaseController");
const upload = require("../middleware/upload");
const { uploadTestCase } = require("../controller/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const testCaseRouter = express.Router();

testCaseRouter.post("/", authMiddleware, adminMiddleware, asyncHandler(createTestCase));
testCaseRouter.get("/problem/:problemId",asyncHandler(getTestCasesByProblemId));
testCaseRouter.post("/upload/:problemId", authMiddleware, adminMiddleware, upload.fields([{ name: "inputFile", maxCount: 1 }, { name: "outputFile", maxCount: 1 }]), uploadTestCase);


module.exports = testCaseRouter;

