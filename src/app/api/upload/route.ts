import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
            {
              text: `You are an expert fact-checker. Read this PDF document and extract the most important factual claims.
Focus on: dates, statistics, financial claims, technical claims, and numerical statements.
Return ONLY a JSON array of objects, where each object has:
- "original_text": The exact text of the claim
- "category": One of (dates, statistics, financial, technical, numerical)

Return ONLY the JSON array, no other text.`,
            },
          ],
        },
      ],
    });

    const responseText = response.text || "[]";
    let claims = [];
    try {
      const match = responseText.match(/\[[\s\S]*\]/);
      claims = JSON.parse(match ? match[0] : responseText);
    } catch (e) {
      console.error("Failed to parse claims JSON:", e);
      console.error("Raw response:", responseText);
    }

    return NextResponse.json({
      success: true,
      reportId: crypto.randomUUID(),
      fileName: file.name,
      claims,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
