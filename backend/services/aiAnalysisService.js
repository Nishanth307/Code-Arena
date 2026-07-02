const AIAnalysis = require("../model/aiAnalysis");

const DIFFICULTY_POINTS = { EASY: 10, MEDIUM: 30, HARD: 50 };

const analyzeComplexity = (code, language) => {
    const nestedLoopPattern = /for\s*\([^)]*\)\s*\{[^}]*for\s*\(/;
    const singleLoopPattern = /for\s*\(|while\s*\(/;
    const hashMapPattern = /(?:unordered_map|map|dict|HashMap|set\(|Object\.|\.get\(|\.has\()/i;
    const sortPattern = /(?:sort|sorted|\.sort\()/i;
    const recursionPattern = /(?:function|def|void|int)\s+\w+[^;{]*\{[^}]*\1|\1\s*\(/;

    let time = "O(1)";
    let space = "O(1)";
    const issues = [];
    const suggestions = [];
    const potentialBugs = [];
    const edgeCasesMissed = [];

    if (nestedLoopPattern.test(code)) {
        time = "O(n²)";
        issues.push("Nested loop detected — may cause performance issues on large inputs");
        suggestions.push("Consider using a hashmap or two-pointer technique for faster lookup");
    } else if (sortPattern.test(code)) {
        time = "O(n log n)";
    } else if (singleLoopPattern.test(code)) {
        time = "O(n)";
    }

    if (hashMapPattern.test(code)) {
        space = "O(n)";
    }

    if (recursionPattern.test(code)) {
        space = "O(n)";
        edgeCasesMissed.push("Deep recursion may cause stack overflow on large inputs");
    }

    if (language === "python" && /input\s*\(\s*\)/.test(code) && !/\.split\(\)/.test(code)) {
        potentialBugs.push("Reading input without .split() may not parse multi-value lines correctly");
    }

    if (language === "cpp" && !/#include\s*<iostream>/.test(code) && /cout|cin/.test(code)) {
        potentialBugs.push("Missing #include <iostream> may cause compilation issues");
    }

    if (/print\s*\(\s*[^)]+\s*\+\s*[^)]+\s*\)/.test(code)) {
        suggestions.push("Use f-strings (Python) or stream operators (C++) for cleaner output formatting");
    }

    if (issues.length === 0 && time === "O(n²)") {
        suggestions.push("Use hashmap for faster lookup to reduce time complexity");
    }

    const codeQuality = issues.length === 0
        ? "Code structure appears reasonable for the given approach"
        : "Code has areas that could be optimized for better performance";

    const codingStyle = /\/\/|#|\/\*/.test(code)
        ? "Includes comments — good practice for readability"
        : "Consider adding comments to explain non-obvious logic";

    return {
        complexity: { time, space },
        codeQuality,
        codingStyle,
        issues,
        suggestions,
        potentialBugs,
        edgeCasesMissed
    };
};

const analyzeSubmission = async (submissionId, code, language, verdict, problemDifficulty) => {
    if (!code || code.trim() === "") {
        return;
    }
    const analysis = analyzeComplexity(code || "", language);

    if (verdict === "WRONG_ANSWER") {
        analysis.issues.push("Output does not match expected result — review algorithm logic");
        analysis.edgeCasesMissed.push("Verify boundary conditions and edge cases (empty input, single element)");
    } else if (verdict === "RUNTIME_ERROR") {
        analysis.potentialBugs.push("Runtime error — check array bounds, division by zero, and null references");
    } else if (verdict === "COMPILATION_ERROR") {
        analysis.potentialBugs.push("Compilation failed — verify syntax, imports, and language-specific requirements");
    } else if (verdict === "TIME_LIMIT_EXCEEDED") {
        analysis.issues.push("Solution exceeds time limit — algorithm may be too slow");
        analysis.suggestions.push("Optimize time complexity or use more efficient data structures");
    } else if (verdict === "ACCEPTED") {
        if (problemDifficulty === "HARD" && analysis.complexity.time === "O(n²)") {
            analysis.suggestions.push("Solution works but may not scale — consider O(n log n) or O(n) approach");
        }
    }

    const doc = await AIAnalysis.findOneAndUpdate(
        { submissionId },
        {
            submissionId,
            ...analysis,
            rawAnalysis: analysis
        },
        { upsert: true, returnDocument: "after" }
    );

    return doc;
};

module.exports = { analyzeSubmission, analyzeComplexity, DIFFICULTY_POINTS };
