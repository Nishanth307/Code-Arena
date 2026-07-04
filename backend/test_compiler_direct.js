const assert = require("assert");
const generateFile = require("./services/compiler/generateFile");
const cleanupFile = require("./services/compiler/cleanupFile");
const CompilerFactoryProvider = require("./services/compiler/CompileFactory/compileFactoryProvide");

const testCases = [
    {
        name: "Python - Simple Output",
        language: "python",
        code: `print("Hello, World!")`,
        input: "",
        expected: "Hello, World!\n"
    },
    {
        name: "Python - Input Piping",
        language: "python",
        code: `import sys\nname = sys.stdin.read().strip()\nprint(f"Hello, {name}!")`,
        input: "Antigravity",
        expected: "Hello, Antigravity!\n"
    },
    {
        name: "C++ - Simple Output",
        language: "cpp",
        code: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}`,
        input: "",
        expected: "Hello from C++!\n"
    },
    {
        name: "C++ - Input Piping",
        language: "cpp",
        code: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string name;\n    if (cin >> name) {\n        cout << "Hello, " << name << "!" << endl;\n    }\n    return 0;\n}`,
        input: "Antigravity",
        expected: "Hello, Antigravity!\n"
    },
    {
        name: "JavaScript - Simple Output",
        language: "javascript",
        code: `console.log("Hello, World!");`,
        input: "",
        expected: "Hello, World!\n"
    },
    {
        name: "JavaScript - Input Piping",
        language: "javascript",
        code: `const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconsole.log("Hello, " + input + "!");`,
        input: "Antigravity",
        expected: "Hello, Antigravity!\n"
    }
];

async function runTests() {
    console.log("Starting Compiler Service direct tests...\n");
    let passed = 0;

    for (const tc of testCases) {
        console.log(`Running test: ${tc.name}...`);
        let filePath;
        try {
            filePath = await generateFile(tc.language, tc.code);
            const factory = CompilerFactoryProvider.getFactory(tc.language);
            const output = await factory.execute(filePath, tc.input);

            assert.strictEqual(output, tc.expected);
            console.log(`✅ Passed: ${tc.name}\n`);
            passed++;
        } catch (error) {
            console.error(`❌ Failed: ${tc.name}`);
            console.error(error);
            console.log();
        } finally {
            if (filePath) {
                await cleanupFile(filePath);
            }
        }
    }

    console.log(`Tests finished. Passed: ${passed}/${testCases.length}`);
    if (passed !== testCases.length) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Unhandle rejection in tests:", err);
    process.exit(1);
});
