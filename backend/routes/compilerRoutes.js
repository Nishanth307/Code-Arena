const express = require("express");
const compilerController = require("../controller/compilerController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateCompilerPayload } = require("../middleware/validatePayload");

const router = express.Router();

router.post("/run", authMiddleware, validateCompilerPayload, compilerController.compileCode);

module.exports = router;
