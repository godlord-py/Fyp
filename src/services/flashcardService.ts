import { geminiService } from "./geminiService"

export interface Flashcard {
  id: string
  front: string
  back: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
  source: string
}

export interface GenerateFlashcardsRequest {
  questions: Array<{
    id: string
    text: string
    answer?: string
    marks?: number
  }>
  subject: string
  numberOfFlashcards?: number
}

export async function generateFlashcards(request: GenerateFlashcardsRequest): Promise<Flashcard[]> {
  if (!geminiService.isConfigured()) {
    console.log("[v0] Gemini not configured for flashcard generation")
    throw new Error("Gemini API not configured")
  }

  try {
    const { questions, subject, numberOfFlashcards = 10 } = request

    // Prepare questions data
    const questionsData = questions.slice(0, numberOfFlashcards).map((q) => ({
      id: q.id,
      question: q.text,
      answer: q.answer || "Not provided",
      marks: q.marks || 5,
    }))

    const instruction = `You are an expert educator. Create concise, study-friendly flashcards from exam answers.

Rules:
- Return ONLY valid JSON array
- Each flashcard must have: "id", "front", "back", "subject", "difficulty"
- "front" is a SHORT study hint or key concept (maximum 20 words - just the essential keyword)
- "back" is a CONCISE answer (maximum 80 words - short, direct, perfect for memorization)
- "difficulty" is "easy", "medium", or "hard" based on marks/complexity
- "subject" is the subject name provided
- Do NOT add any text outside the JSON array
- Return exactly one flashcard per answer`

    const prompt = `${instruction}

Subject: ${subject}

Questions and Answers:
${JSON.stringify(questionsData, null, 2)}

Generate ${Math.min(numberOfFlashcards, questionsData.length)} flashcards. Return ONLY the JSON array:`

    console.log(`[v0] Generating ${numberOfFlashcards} flashcards for ${subject}...`)
    const result = await geminiService.generateJSON(prompt)

    if (Array.isArray(result) && result.length > 0) {
      return result
        .map((item: any) => ({
          id: String(item.id || item.front?.substring(0, 10) || Math.random().toString()),
          front: String(item.front || ""),
          back: String(item.back || ""),
          subject: String(subject),
          difficulty: validateDifficulty(item.difficulty),
          source: "Generated from questions",
        }))
        .filter((card) => card.front && card.back)
    }

    console.warn("[v0] Gemini returned invalid format")
    throw new Error("Invalid response format from AI")
  } catch (error) {
    console.error("[v0] Error generating flashcards:", error)
    throw error
  }
}

function validateDifficulty(value: any): "easy" | "medium" | "hard" {
  const valid = ["easy", "medium", "hard"]
  const normalized = String(value).toLowerCase()
  return valid.includes(normalized) ? (normalized as any) : "medium"
}
