// src/app/api/financial-advice/route.js
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { totalBudget, totalIncome, totalSpent } = await request.json();

    const prompt = `You are a concise personal finance assistant.
        Total budgeted: $${Number(totalBudget) || 0}
        Total income: $${Number(totalIncome) || 0}
        Total spent: $${Number(totalSpent) || 0}
        Give 2-3 sentences of practical advice based on these numbers.`;

    const response = await openai.responses.create({
      model: "gpt-3.5", // keep whichever model your account can use
      input: prompt,
    });

    return NextResponse.json({ advice: response.output_text });
  } catch (error) {
    console.error("OpenAI Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to generate financial advice." },
      { status: 500 }
    );
  }
}