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

export async function generateSolutionForQuestion(q: QuestionForSolution): Promise<string> {
  if (!geminiService.isConfigured()) {
    return "AI service not configured. Please set VITE_GEMINI_API_KEY to enable solution generation."
  }

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

  // We leverage summarizeText to avoid duplicating API client setup; we embed formatting instructions
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

  // geminiService.summarizeText(text, subject, summaryType?)
  const answer = await geminiService.summarizeText(formattedRequest, subject, "comprehensive")
  return answer?.trim() || "No solution was generated."
}
