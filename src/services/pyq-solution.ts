import { GenAIClient, getGenAIClient, type GenAIClientOptions } from "../lib/genai-client"

export type PYQ = {
  id?: string | number
  question: string
  options?: string[] // for MCQs
  answer?: string // official or expected answer (optional, can help steer)
  subject?: string
  year?: string | number
  marks?: string | number
  extraContext?: string
}

const DEFAULT_SYSTEM = [
  "You are a helpful exam solution assistant.",
  "Provide clear, concise, step-by-step reasoning only as needed.",
  "If multiple options are given, analyze each and justify the correct one.",
  "Prefer bullet points for readability when appropriate.",
].join("\n")

function buildPrompt(q: PYQ) {
  const lines: string[] = []
  if (q.subject) lines.push(`Subject: ${q.subject}`)
  if (q.year) lines.push(`Year: ${q.year}`)
  if (q.marks) lines.push(`Marks: ${q.marks}`)
  if (q.extraContext) lines.push(`Context: ${q.extraContext}`)
  lines.push("")
  lines.push("Question:")
  lines.push(q.question)

  if (q.options?.length) {
    lines.push("")
    lines.push("Options:")
    q.options.forEach((opt, idx) => lines.push(`${idx + 1}. ${opt}`))
  }

  if (q.answer) {
    lines.push("")
    lines.push("If known, the expected/correct answer is provided:")
    lines.push(q.answer)
    lines.push("Explain briefly why this is correct and why other options are incorrect (if applicable).")
  } else if (q.options?.length) {
    lines.push("")
    lines.push("Choose the best option and explain briefly your reasoning.")
  } else {
    lines.push("")
    lines.push("Provide a clear and concise solution. Include key steps or formulas as needed.")
  }

  return lines.join("\n")
}

/**
 * Generate solution text for a single PYQ.
 * You can pass an existing GenAIClient or let this create/use the singleton.
 */
export async function generateSolutionForQuestion(
  pyq: PYQ,
  clientOrOpts?: GenAIClient | GenAIClientOptions,
): Promise<string> {
  const client =
    clientOrOpts instanceof GenAIClient ? clientOrOpts : getGenAIClient(clientOrOpts as GenAIClientOptions | undefined)
  const prompt = buildPrompt(pyq)
  const text = await client.generateText(prompt, DEFAULT_SYSTEM)
  return text
}

/**
 * Optional: batch multiple PYQs in one call.
 * Note: Large batches may exceed token limits; use small batches (e.g., 3-5).
 */
export async function generateSolutionsBatch(
  items: PYQ[],
  clientOrOpts?: GenAIClient | GenAIClientOptions,
): Promise<Array<{ id?: PYQ["id"]; text: string }>> {
  const client =
    clientOrOpts instanceof GenAIClient ? clientOrOpts : getGenAIClient(clientOrOpts as GenAIClientOptions | undefined)

  const joined = items
    .map((q, i) => {
      const id = q.id ?? `q${i + 1}`
      return [
        `ID: ${id}`,
        buildPrompt(q),
        // delimiter to help the model separate answers
        "---",
      ].join("\n")
    })
    .join("\n")

  const instruction = [
    DEFAULT_SYSTEM,
    "You will receive multiple questions separated by a line with three dashes (---).",
    "Answer them in order using the exact format:",
    "",
    "BEGIN",
    "ID: <same id>",
    "ANSWER:",
    "<your answer>",
    "END",
    "",
    "Repeat for each question.",
  ].join("\n")

  const text = await client.generateText(joined, instruction)

  // Return raw text per item (simple approach); caller can parse further if needed.
  // You can also implement structured parsing here if you enforce a rigid output format.
  return items.map((q, i) => ({ id: q.id ?? `q${i + 1}`, text }))
}
