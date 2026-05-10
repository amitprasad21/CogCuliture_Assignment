import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function getTavily() {
  return tavily({ apiKey: process.env.TAVILY_API_KEY });
}

export async function POST(req: Request) {
  try {
    const { claimText, category } = await req.json();

    if (!claimText) {
      return NextResponse.json(
        { error: "Claim text is required" },
        { status: 400 }
      );
    }

    const tvly = getTavily();
    const searchResponse = await tvly.search(claimText, {
      searchDepth: "advanced",
      includeAnswer: true,
      maxResults: 3,
    });

    const sourcesContext = searchResponse.results
      .map((result: { title: string; url: string; content: string }) => {
        return `Source: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`;
      })
      .join("\n\n");

    const ai = getAI();
    const prompt = `
      You are an expert fact-checker. Please verify the following claim using the provided search results.

      Claim to verify: "${claimText}"
      Category: ${category || "General"}

      Search Results:
      ${sourcesContext}

      Determine if the claim is "verified", "inaccurate", "false", or "misleading".
      Provide a confidence score between 0 and 100.
      Provide a corrected fact if the claim is false, inaccurate, or misleading.
      Provide a detailed explanation of your reasoning.

      Respond ONLY in JSON format:
      {
        "status": "verified" | "inaccurate" | "false" | "misleading",
        "confidence_score": number,
        "corrected_fact": "string or null",
        "explanation": "string"
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = aiResponse.text || "{}";
    let verificationResult: Record<string, unknown> = {};
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      verificationResult = JSON.parse(match ? match[0] : responseText);
    } catch {
      verificationResult = {
        status: "unverified",
        confidence_score: 0,
        explanation: "Failed to parse AI response.",
      };
    }

    return NextResponse.json({
      ...verificationResult,
      sources: searchResponse.results.map(
        (r: { title: string; url: string; content: string }) => ({
          title: r.title,
          url: r.url,
          snippet: r.content.substring(0, 150) + "...",
        })
      ),
    });
  } catch (error) {
    console.error("Error verifying claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
