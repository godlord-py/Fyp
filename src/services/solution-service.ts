import { geminiService } from "./geminiService"

export type QuestionForSolution = {
  id?: string
  questionText: string
  subject?: string
  topic?: string
  type?: string
  marks?: number
  tableData?: { headers: string[]; rows: string[][] } | null
  imageDescription?: string | null
}

export const SOLUTION_STORAGE_PREFIX = "pyq_solution_"

class SolutionQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  private readonly DELAY_BETWEEN_REQUESTS = 5000 // 5 seconds between requests

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        await task()
        // Wait between requests to avoid rate limiting
        if (this.queue.length > 0) {
          console.log(`[v0] Waiting ${this.DELAY_BETWEEN_REQUESTS}ms before next solution generation`)
          await new Promise((resolve) => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS))
        }
      }
    }

    this.processing = false
  }

  getQueueLength(): number {
    return this.queue.length
  }
}

const solutionQueue = new SolutionQueue()

function getCachedSolution(questionId: string): string | null {
  try {
    const cached = localStorage.getItem(`${SOLUTION_STORAGE_PREFIX}${questionId}`)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is less than 7 days old
      const cacheAge = Date.now() - (parsed.timestamp || 0)
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
      if (cacheAge < SEVEN_DAYS) {
        console.log(`[v0] Using cached solution for question ${questionId}`)
        return parsed.solution
      }
    }
  } catch (error) {
    console.error("Error reading cached solution:", error)
  }
  return null
}

function saveSolutionToCache(questionId: string, solution: string) {
  try {
    localStorage.setItem(
      `${SOLUTION_STORAGE_PREFIX}${questionId}`,
      JSON.stringify({
        solution,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error("Error saving solution to cache:", error)
  }
}

export async function generateSolutionForQuestion(q: QuestionForSolution): Promise<string> {
  // Check cache first
  if (q.id) {
    const cached = getCachedSolution(q.id)
    if (cached) {
      return cached
    }
  }

  if (!geminiService.isConfigured()) {
    return "AI service not configured. Please set VITE_GEMINI_API_KEY to enable solution generation."
  }

  // Add to queue to prevent simultaneous requests
  const solution = await solutionQueue.add(async () => {
    const subject = q.subject || "General"
    const context: string[] = []

    context.push(`Question: ${q.questionText}`)

    if (q.topic) context.push(`Topic: ${q.topic}`)
    if (q.type) context.push(`Type: ${q.type}`)
    if (q.marks) context.push(`Marks: ${q.marks}`)
    if (q.imageDescription) context.push(`Image/Diagram context: ${q.imageDescription}`)
    if (q.tableData && q.tableData.headers?.length) {
      const tablePreview = [
        `Table Headers: ${q.tableData.headers.join(", ")}`,
        `First Row: ${q.tableData.rows?.[0]?.join(" | ") || "n/a"}`,
      ].join("\n")
      context.push(`Table Data (preview):\n${tablePreview}`)
    }

    const formattedRequest = `
${context.join("\n")}

Instruction: Provide a clear, properly formatted solution using Markdown.

Formatting rules (follow strictly):
- Begin with a "### Final Answer" section containing the final result or conclusion in 1-3 lines.
- Then "### Step-by-Step Solution" with numbered steps and short explanations.
- If applicable, include formulas or equations inline. Keep it readable in plain text Markdown.
- Add "### Key Concepts" with 3-5 concise bullet points.
- Keep the depth aligned with the marks (${q.marks || "appropriate"}), and avoid unnecessary verbosity.
`

    const answer = await geminiService.summarizeText(formattedRequest, subject, "comprehensive")
    const finalSolution = answer?.trim() || "No solution was generated."

    // Save to cache
    if (q.id) {
      saveSolutionToCache(q.id, finalSolution)
    }

    return finalSolution
  })

  return solution
}

export async function generateSolutionsForMultipleQuestions(
  questions: QuestionForSolution[],
  onProgress?: (current: number, total: number) => void,
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    if (q.id) {
      try {
        const solution = await generateSolutionForQuestion(q)
        results.set(q.id, solution)
        if (onProgress) {
          onProgress(i + 1, questions.length)
        }
      } catch (error) {
        console.error(`Failed to generate solution for question ${q.id}:`, error)
        results.set(q.id, "Failed to generate solution. Please try again later.")
      }
    }
  }

  return results
}

export function getSolutionQueueStatus() {
  return {
    queueLength: solutionQueue.getQueueLength(),
    isProcessing: solutionQueue.getQueueLength() > 0,
  }
}

export function clearSolutionCache() {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(SOLUTION_STORAGE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
  console.log("[v0] Solution cache cleared")
}
