import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const { message } = await request.json();

        const response = await openai.responses.create({
            model: "gpt-5.5",
            input: message,
        });

        return NextResponse.json({
            advice: response.output_text,
        });

    } catch (error) {
        console.error("OpenAI Error:", error);

        return NextResponse.json(
            { error: "Failed to generate financial advice." },
            { status: 500 }
        );
    }
}