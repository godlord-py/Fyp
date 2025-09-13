import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { questions } = await request.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions data" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const questionsText = questions
      .map(
        (q) =>
          `Subject: ${q.subject}, Topic: ${q.topic}, Year: ${q.year}, Difficulty: ${q.difficulty}, Question: ${q.questionText}`,
      )
      .join("\n\n")

    const prompt = `Analyze the following exam questions and provide insights in JSON format. Look for:
1. Repeated question patterns with frequency percentages
2. Twisted questions (variations of common concepts)
3. Study recommendations

Questions:
${questionsText}

Respond with a JSON object containing:
{
  "repeatedQuestions": [
    {
      "pattern": "description of pattern",
      "frequency": number (0-100),
      "years": [array of years],
      "subjects": [array of subjects]
    }
  ],
  "twistedQuestions": [
    {
      "id": "question id",
      "originalConcept": "base concept",
      "twist": "how it's modified",
      "difficulty": "difficulty assessment"
    }
  ],
  "studyTips": [
    {
      "subject": "subject name",
      "tip": "specific study recommendation",
      "priority": "high/medium/low"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    try {
      const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ""))
      return NextResponse.json(analysis)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return NextResponse.json({
        repeatedQuestions: [],
        twistedQuestions: [],
        studyTips: [{ subject: "General", tip: "Continue practicing regularly", priority: "medium" }],
      })
    }
  } catch (error) {
    console.error("AI Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze questions" }, { status: 500 })
  }
}
