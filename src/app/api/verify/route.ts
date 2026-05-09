import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function POST(req: Request) {
  try {
    const { claimText, category } = await req.json();

    if (!claimText) {
      return NextResponse.json({ error: "Claim text is required" }, { status: 400 });
    }

    // 1. Search Tavily for the claim
    const searchResponse = await tvly.search(claimText, {
      searchDepth: "advanced",
      includeAnswer: true,
      maxResults: 3,
    });

    const sourcesContext = searchResponse.results.map((result: any) => {
      return `Source: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`;
    }).join("\n\n");

    // 2. Use Gemini to verify the claim based on Tavily results
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
    let verificationResult = {};
    try {
      const match = responseText.match(/\{.*\}/s);
      verificationResult = JSON.parse(match ? match[0] : responseText);
    } catch (e) {
      console.error("Failed to parse verification JSON", e);
      verificationResult = { status: "unverified", confidence_score: 0, explanation: "Failed to parse AI response." };
    }

    return NextResponse.json({
      ...verificationResult,
      sources: searchResponse.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.substring(0, 150) + "..."
      }))
    });

  } catch (error) {
    console.error("Error verifying claim:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
