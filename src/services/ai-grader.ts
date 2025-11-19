import { geminiService } from "./geminiService"

type QAInput = {
  id: string
  question: string
  subject?: string
  type?: string
  correctAnswer?: string | null
  marks?: number
}

export type GradedAnswer = {
  id: string
  correct: boolean
  confidence: number
  feedback: string
}

export async function gradeAnswersWithGemini(
  questions: QAInput[],
  answers: Record<string, string>,
): Promise<GradedAnswer[]> {
  if (!geminiService.isConfigured()) {
    console.log("[v0] Gemini not configured, using fallback grading")
    // Fallback: basic grading without AI
    return questions.map((q) => ({
      id: q.id,
      correct: false,
      confidence: 0.3,
      feedback: "AI service not available. Please configure Gemini API key.",
    }))
  }

  try {
    const payload = questions.map((q) => ({
      id: q.id,
      subject: q.subject || "General",
      type: q.type || "subjective",
      marks: q.marks ?? 5,
      question: q.question,
      userAnswer: (answers[q.id] || "").trim(),
      correctAnswer: q.correctAnswer ?? null,
    }))

    const instruction = `You are a strict examiner. Grade each answer fairly and return ONLY valid JSON.

Rules:
- Return ONLY a JSON array with objects: { "id": string, "correct": boolean, "confidence": number, "feedback": string }
- "confidence" must be between 0 and 1
- For MCQ type with correctAnswer: correct = (userAnswer === correctAnswer)
- For subjective: judge based on content relevance and accuracy
- Keep feedback brief (1-2 lines max)
- NEVER add any text outside the JSON array`

    const prompt = `${instruction}

Questions and Answers:
${JSON.stringify(payload, null, 2)}

Return ONLY the JSON array:`

    console.log("[v0] Sending grading request to Gemini...")
    const result = await geminiService.generateJSON(prompt)

    if (Array.isArray(result) && result.length > 0) {
      return result.map((item: any) => ({
        id: String(item.id || ""),
        correct: Boolean(item.correct),
        confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
        feedback: String(item.feedback || "No feedback available"),
      }))
    }

    console.warn("[v0] Gemini returned invalid format, using fallback")
    return questions.map((q) => ({
      id: q.id,
      correct: false,
      confidence: 0.2,
      feedback: "Could not grade - service error",
    }))
  } catch (error) {
    console.error("[v0] Error in gradeAnswersWithGemini:", error)
    return questions.map((q) => ({
      id: q.id,
      correct: false,
      confidence: 0.1,
      feedback: "Grading failed - please try again",
    }))
  }
}
