import { OpenAI } from "openai/client.js";

const opneai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// This is used to send a request to OpenAI to get AI generated 
// financial advice
const getFinancialAdvice = async (totalBudget, totalIncome, totalSpent) => {
    try {
        const userPrompt = `
        Based on the following financial data:
        - Total Budget: ${totalBudget} USD
        - Expenses: ${totalSpent} USD
        - Incomes: ${totalIncome} USD
        provide detailed financial advice in 2 sentences to help the user manage their finances.
        `

        const chatCompletion = await opneai.chat.completions.create({
            model:"gpt-4",
            messages:[{role: "user", content: userPrompt
            }]
        });

        const advice = chatCompletion.choices[0].message.content;

        return advice
    } catch (error) {
        console.error("Error fetching financial advice:", error);
        return "Sorry, I couldn't fetch the financial advice at this moment. Please try again later.";
    }
};

export default getFinancialAdvice;