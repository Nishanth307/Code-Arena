const settings = require("../config/settings");

const generateAIAnalysis = async (promptText) => {
    const apiKey = process.env.GEMINI_API_KEY || settings.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the server. Please add it to your environment variables.");
    }

    const modelName = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: promptText
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
        throw new Error("Invalid or empty response structure from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    try {
        const parsedJSON = JSON.parse(responseText);
        return parsedJSON;
    } catch (parseError) {
        throw new Error(`Failed to parse Gemini response as JSON: ${responseText}`);
    }
};

module.exports = { generateAIAnalysis };
