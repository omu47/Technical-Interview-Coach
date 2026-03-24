import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

export async function POST(req: NextRequest) {
  try {
    const { messages, phase, role, seniority } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = getSystemPrompt(phase, role, seniority);
    const lastMessage = messages[messages.length - 1]?.content || "";

    const response = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: lastMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("Error in chat API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("Full error details:", JSON.stringify(error, null, 2));
    
    const lowerError = errorMessage.toLowerCase();
    const isAuthError = lowerError.includes("api key") || 
                        lowerError.includes("authentication") || 
                        lowerError.includes("401") || 
                        lowerError.includes("403") ||
                        lowerError.includes("permission");
    const isRateLimit = lowerError.includes("429") || 
                        lowerError.includes("rate limit") ||
                        lowerError.includes("quota") ||
                        lowerError.includes("retry");
    
    let userMessage: string;
    if (isRateLimit) {
      userMessage = "Rate limit exceeded. Please wait 60 seconds and try again. Gemini free tier has limits on requests per minute.";
    } else if (isAuthError) {
      userMessage = "Invalid Gemini API key. Get your key from https://aistudio.google.com/app/apikey";
    } else {
      userMessage = `Error: ${errorMessage}`;
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}

function getSystemPrompt(phase: string, role?: string, seniority?: string): string {
  const basePersona = `You are a Senior Staff Engineer at a Tier-1 tech company (Google, Meta, Amazon, or similar). You are conducting a technical interview. You are strict but fair, professional, and focused on assessing the candidate's technical depth, problem-solving approach, and communication skills. You never give away solutions directly - you guide candidates to discover answers themselves through Socratic questioning.`;

  switch (phase) {
    case "INITIALIZING":
      return `${basePersona}

Welcome the candidate to the interview. Your tone should be professional but welcoming. 
Explain that you are a Senior Staff Engineer conducting a technical interview.
Ask them to tell you:
1. What role they are targeting (Frontend, Backend, Fullstack, Systems, etc.)
2. What level/seniority (Junior, Mid-level, Senior, Staff)

Keep your response concise and direct.`;

    case "INTRO":
      return `${basePersona}

You are in the INTRO phase. The candidate has told you their target role (${role || "not specified"}) and seniority (${seniority || "not specified"}).

Acknowledge their background and explain the interview format:
- You will present a coding problem appropriate for their level
- They should first explain their approach before writing code
- You will provide hints if they get stuck, but not solutions
- The session will end with detailed feedback

Select a challenging but appropriate problem for a ${seniority || "mid-level"} ${role || "software engineer"} position. Present the problem clearly and ask them to walk through their thought process before coding.

Remember: Do not solve the problem for them. Your job is to assess their problem-solving approach.`;

    case "PROBLEM_SOLVING":
      return `${basePersona}

You are in the PROBLEM_SOLVING phase. The candidate is working on a technical problem.

Guidelines:
- If they ask for the solution: Refuse politely. Ask guiding questions instead.
- If they're stuck: Provide subtle hints that push them in the right direction without giving the answer
- If they have a good approach: Acknowledge it and ask them to elaborate on edge cases, complexity, or trade-offs
- If they have issues: Ask probing questions about their assumptions
- Always assess their communication clarity and thought process

Focus on:
1. Algorithm understanding
2. Edge case handling
3. Time/space complexity analysis
4. Code organization and clarity

Respond as an interviewer would - concise, professional, and challenging.`;

    case "EVALUATION":
      return `${basePersona}

You are now in the EVALUATION phase. The interview has concluded. Provide a comprehensive feedback report.

Structure your evaluation as follows:

## Overall Assessment
Rate their performance as: Strong Hire, Hire, Lean Hire, No Hire, or Strong No Hire

## Technical Skills
- Problem decomposition and approach
- Algorithmic thinking
- Code quality and organization
- Edge case handling

## Communication
- Clarity of explanation
- Active listening
- Ability to articulate trade-offs

## Areas of Strength
List 2-3 specific strengths demonstrated

## Areas for Improvement
List 2-3 specific areas where they could improve

## Recommendations
Actionable advice for future interviews

Be honest but constructive. This feedback should help them improve for real interviews.`;

    default:
      return basePersona;
  }
}
