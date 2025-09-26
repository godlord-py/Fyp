import { geminiService } from "./geminiService"

type QAInput = {
  id: string
  questionText: string
  subject?: string
  type?: string
  correctAnswer?: string | null
  marks?: number
  // Any extra context fields can be added here
}

export type GradedAnswer = {
  id: string
  correct: boolean
  confidence: number // 0..1
  feedback: string
}

export async function gradeAnswersWithGemini(
  questions: QAInput[],
  answers: Record<string, string>,
): Promise<GradedAnswer[]> {
  if (!geminiService.isConfigured()) {
    // Fallback: mark as incorrect unless MCQ with exact match
    return questions.map((q) => {
      const user = (answers[q.id] || "").trim()
      const correct = q.type === "mcq" && q.correctAnswer ? user === q.correctAnswer : false
      return {
        id: q.id,
        correct,
        confidence: correct ? 0.6 : 0.3,
        feedback: correct ? "Exact match" : "AI disabled; manual check needed.",
      }
    })
  }

  const payload = questions.map((q) => ({
    id: q.id,
    subject: q.subject || "General",
    type: q.type || "subjective",
    marks: q.marks ?? null,
    question: q.questionText,
    userAnswer: (answers[q.id] || "").trim(),
    correctAnswer: q.correctAnswer ?? null,
  }))

  const instruction = `
You are a strict examiner. Grade each answer fairly.

Rules:
- Return ONLY strict JSON (no prose), an array of { "id": string, "correct": boolean, "confidence": number, "feedback": string }.
- "confidence" is 0..1 about the correctness judgment.
- If "type" is "mcq" and "correctAnswer" is present, correct = (userAnswer === correctAnswer).
- For subjective answers, judge factual and conceptual alignment with the question; be conservative.
- Keep feedback brief (<= 2 lines) and specific (mention key missing/wrong points).
`

  const prompt = `${instruction}

QuestionsAndAnswers:
${JSON.stringify(payload, null, 2)}
`

  let json = await geminiService.generateJSON(prompt)

  // Retry once with a tighter instruction if parsing failed
  if (!Array.isArray(json)) {
    const retryPrompt = `Return ONLY a JSON array (no commentary). Each item must be:
{ "id": string, "correct": boolean, "confidence": number, "feedback": string }.
"confidence" is 0..1. Use exact string compare for MCQ when correctAnswer is provided.

QuestionsAndAnswers:
${JSON.stringify(payload, null, 2)}`
    json = await geminiService.generateJSON(retryPrompt)
  }

  if (Array.isArray(json)) {
    return json.map((item: any) => ({
      id: String(item.id),
      correct: Boolean(item.correct),
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
      feedback: typeof item.feedback === "string" ? item.feedback : "",
    }))
  }

  // Conservative fallback (MCQ exact, others unverified)
  return questions.map((q) => {
    const user = (answers[q.id] || "").trim()
    const correct = q.type === "mcq" && q.correctAnswer ? user === q.correctAnswer : false
    return {
      id: q.id,
      correct,
      confidence: correct ? 0.55 : 0.25,
      feedback: correct ? "Exact match" : "Could not verify via AI; likely incorrect or needs manual review.",
    }
  })
}
