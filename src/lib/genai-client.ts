import { GoogleGenerativeAI, type GenerativeModel } from "@google/genai"

type QueueTask<T> = {
  run: () => Promise<T>
  resolve: (v: T) => void
  reject: (e: unknown) => void
}

type BackoffOptions = {
  baseDelayMs?: number
  maxDelayMs?: number
  maxRetries?: number
  jitter?: boolean
}

const defaultBackoff: Required<BackoffOptions> = {
  baseDelayMs: 4000, // start a bit conservatively to reduce 429s
  maxDelayMs: 30000,
  maxRetries: 4,
  jitter: true,
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

function withJitter(ms: number) {
  const jitter = Math.random() * 0.25 + 0.75 // 0.75x - 1.0x
  return Math.floor(ms * jitter)
}

/**
 * A minimal single-concurrency queue to throttle requests.
 */
class SingleFlightQueue {
  private queue: QueueTask<unknown>[] = []
  private running = false
  private minIntervalMs: number

  constructor(minIntervalMs = 5000) {
    this.minIntervalMs = minIntervalMs
  }

  enqueue<T>(run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ run, resolve, reject })
      this.process()
    })
  }

  private async process() {
    if (this.running) return
    this.running = true

    while (this.queue.length) {
      const task = this.queue.shift()!
      try {
        const result = await task.run()
        task.resolve(result)
      } catch (e) {
        task.reject(e)
      }
      // enforce pacing between requests
      await sleep(this.minIntervalMs)
    }

    this.running = false
  }
}

export type GenAIClientOptions = {
  apiKey?: string
  modelName?: string
  minIntervalMs?: number
  backoff?: BackoffOptions
}

export class GenAIClient {
  private genAI: GoogleGenerativeAI
  private modelName: string
  private model?: GenerativeModel
  private queue: SingleFlightQueue
  private backoff: Required<BackoffOptions>

  constructor(opts: GenAIClientOptions = {}) {
    const apiKey =
      opts.apiKey ||
      // Allow Node/server usage via environment variable. Do not expose on client.
      (typeof process !== "undefined" ? (process.env.GEMINI_API_KEY as string | undefined) : undefined)

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY missing. Pass apiKey to GenAIClient or set GEMINI_API_KEY.")
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.modelName = opts.modelName || "gemini-1.5-flash"
    this.queue = new SingleFlightQueue(opts.minIntervalMs ?? 5000)
    this.backoff = { ...defaultBackoff, ...(opts.backoff || {}) }
  }

  private getModel() {
    if (!this.model) {
      this.model = this.genAI.getGenerativeModel({ model: this.modelName })
    }
    return this.model
  }

  /**
   * generateText: Calls Gemini with retry/backoff and queues requests to avoid 429s.
   */
  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    return this.queue.enqueue<string>(async () => {
      const exec = async () => {
        const model = this.getModel()
        const contents = systemInstruction
          ? [
              { role: "user", parts: [{ text: systemInstruction }] as const },
              { role: "user", parts: [{ text: prompt }] as const },
            ]
          : [{ role: "user", parts: [{ text: prompt }] as const }]

        // Debug logging (remove if not needed)
        // console.log("[v0] GenAI request contents length:", contents.length)

        const resp = await model.generateContent({ contents })
        const text = resp.response?.text?.()
        if (!text || !text.trim()) {
          throw new Error("Empty response from Gemini.")
        }
        return text.trim()
      }

      let attempt = 0
      let delay = this.backoff.baseDelayMs

      // retry on 429/5xx (best-effort; SDK errors often contain status in message)
      while (true) {
        try {
          return await exec()
        } catch (err: any) {
          attempt++
          const msg = String(err?.message || err)
          const retriable =
            msg.includes("429") ||
            msg.includes("rate") ||
            msg.includes("quota") ||
            msg.includes("503") ||
            msg.includes("500") ||
            msg.includes("temporarily")

          if (!retriable || attempt > this.backoff.maxRetries) {
            // console.log("[v0] GenAI final error:", msg)
            throw err
          }

          const wait = this.backoff.jitter ? withJitter(delay) : delay
          // console.log(`[v0] Rate-limited or transient error. Retry ${attempt}/${this.backoff.maxRetries} after ${wait}ms`)
          await sleep(wait)
          delay = Math.min(delay * 2, this.backoff.maxDelayMs)
        }
      }
    })
  }
}

// Convenience singleton if you prefer not to instantiate multiple clients.
// Note: Prefer passing apiKey in constructor when possible.
let singleton: GenAIClient | null = null
export function getGenAIClient(opts?: GenAIClientOptions) {
  if (!singleton) singleton = new GenAIClient(opts)
  return singleton
}
