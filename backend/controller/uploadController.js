const asyncHandler = require("../middleware/asyncHandler");
const storage = require("../services/storage");
const TestCase = require("../model/testCase");

exports.uploadTestCase = asyncHandler(async (req, res) => {
    const { problemId } = req.params;

    const inputFile = req.files.inputFile[0];
    const outputFile = req.files.outputFile[0];

    const timestamp = Date.now();

    const inputPath = `testcases/${problemId}/input_${timestamp}.txt`;
    const outputPath = `testcases/${problemId}/output_${timestamp}.txt`;

    await storage.putObject(inputPath, inputFile.buffer);
    await storage.putObject(outputPath, outputFile.buffer);

    const testCase = await TestCase.create({
        problemId,
        inputPath,
        outputPath,
        isHidden: true
    });

    res.status(201).json({
        success: true,
        message: "Test case uploaded successfully",
        data: testCase,
    });
});