import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    const truncatedText = text.substring(0, 5000);

    const prompt = `
      You are an expert fact-checker. Extract the most important factual claims from the following text.
      Focus on: dates, statistics, financial claims, technical claims, and numerical statements.
      Return ONLY a JSON array of objects, where each object has:
      - "original_text": The exact text of the claim
      - "category": One of (dates, statistics, financial, technical, numerical)

      Text to analyze:
      ${truncatedText}
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "[]";
    let claims = [];
    try {
      const match = responseText.match(/\[[\s\S]*\]/);
      claims = JSON.parse(match ? match[0] : responseText);
    } catch (e) {
      console.error("Failed to parse claims JSON", e);
    }

    return NextResponse.json({
      success: true,
      reportId: crypto.randomUUID(),
      fileName: file.name,
      claims,
    });
  } catch (error) {
    console.error("Error in upload processing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
