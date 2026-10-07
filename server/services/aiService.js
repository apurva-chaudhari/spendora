const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.AI_API_KEY,
});

const categories = [
    "Food",
    "Groceries",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
];

const categorizeExpense = async (title, description = "") => {
    const text = `${title} ${description}`.toLowerCase();

    if (
        text.includes("grocery") ||
        text.includes("supermarket") ||
        text.includes("vegetable") ||
        text.includes("milk") ||
        text.includes("rice") ||
        text.includes("bread")
    ) {
        return "Groceries";
    }

    if (
        text.includes("restaurant") ||
        text.includes("food") ||
        text.includes("pizza") ||
        text.includes("burger") ||
        text.includes("cafe") ||
        text.includes("coffee")
    ) {
        return "Food";
    }

    if (
        text.includes("uber") ||
        text.includes("ola") ||
        text.includes("metro") ||
        text.includes("bus") ||
        text.includes("taxi") ||
        text.includes("fuel") ||
        text.includes("petrol")
    ) {
        return "Transport";
    }

    if (
        text.includes("amazon") ||
        text.includes("flipkart") ||
        text.includes("shopping") ||
        text.includes("clothes") ||
        text.includes("shoes")
    ) {
        return "Shopping";
    }

    if (
        text.includes("movie") ||
        text.includes("netflix") ||
        text.includes("spotify") ||
        text.includes("game")
    ) {
        return "Entertainment";
    }

    if (
        text.includes("hospital") ||
        text.includes("pharmacy") ||
        text.includes("medicine") ||
        text.includes("doctor")
    ) {
        return "Healthcare";
    }

    if (
        text.includes("school") ||
        text.includes("college") ||
        text.includes("course") ||
        text.includes("book")
    ) {
        return "Education";
    }

    if (
        text.includes("hotel") ||
        text.includes("flight") ||
        text.includes("train") ||
        text.includes("travel")
    ) {
        return "Travel";
    }

    return "Other";
};

const categorizeExpenseWithAI = async (
    title,
    description = ""
) => {
    const prompt = `
You are an expense categorization assistant.

Choose exactly ONE category from this list:

${categories.join(", ")}

Expense title:
${title}

Expense description:
${description}

Return ONLY the category name.
Do not return explanations.
`;

    const response = await openai.responses.create({
        model: process.env.AI_MODEL || "gpt-6-luna",
        input: prompt,
    });

    const result = response.output_text.trim();

    if (categories.includes(result)) {
        return result;
    }

    return "Other";
};
const categorizeExpenseSmart = async (title, description = "") => {
    try {
        return await categorizeExpenseWithAI(title, description);
    } catch (error) {
        console.error("AI categorization failed. Using fallback:", error.message);

        return await categorizeExpense(title, description);
    }
};
const generateSpendingInsights = async (spendingData) => {
    const prompt = `
You are a personal spending analysis assistant for an expense management application.

Analyze the following spending data and provide useful, practical insights.

Spending data:
${JSON.stringify(spendingData, null, 2)}

Return ONLY valid JSON in exactly this format:

{
    "summary": "One short overall spending summary.",
    "insights": [
        "Insight 1",
        "Insight 2",
        "Insight 3"
    ]
}

Rules:
- Provide exactly 3 insights.
- Keep each insight concise.
- Compare current and previous month when possible.
- Mention important increases or decreases.
- Identify the highest spending category when possible.
- Do not give financial investment advice.
- Do not include markdown.
- Return JSON only.
`;

    const response = await openai.responses.create({
        model: process.env.AI_MODEL,
        input: prompt,
    });

    const result = response.output_text.trim();

    try {
        return JSON.parse(result);
    } catch (error) {
        console.error("AI insights JSON parsing failed:", error.message);

        return {
            summary: "Unable to generate spending summary.",
            insights: [],
        };
    }
};
const askSpendora = async (question, expenses) => {
    const prompt = `
You are Spendora, an AI spending assistant.

Answer the user's question using only the provided expense data.

User question:
${question}

Expense data:
${JSON.stringify(expenses, null, 2)}

Rules:
- Answer clearly and concisely.
- Use Indian Rupees (₹) for monetary amounts.
- If the data does not contain enough information, say so.
- Do not invent expenses or amounts.
- Do not provide investment or financial advice.
- Do not mention technical details such as JSON, databases, APIs, or backend systems.
`;

    const response = await openai.responses.create({
        model: process.env.AI_MODEL,
        input: prompt,
    });

    return response.output_text.trim();
};

module.exports = {
    categorizeExpense,
    categorizeExpenseWithAI,
    categorizeExpenseSmart,
    generateSpendingInsights,
    askSpendora,
};