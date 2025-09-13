import { GoogleGenAI } from "@google/genai"

class GeminiService {
  private ai: GoogleGenAI | null = null

  constructor() {
    this.initializeAPI()
  }

  private initializeAPI() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey })
    }
  }

  isConfigured(): boolean {
    return this.ai !== null
  }

  async summarizeText(text: string): Promise<string> {
    if (!this.ai) {
      throw new Error("Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment variables.")
    }

    const prompt = `Please provide a comprehensive summary of the following text. Focus on the key points, main ideas, and important details:

${text}

Summary:`

    try {
      const result = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-001", // update model name to valid latest
        contents: prompt,
      })

      return result.text
    } catch (error) {
      console.error("Error generating summary:", error)
      throw new Error("Failed to generate summary. Please try again.")
    }
  }

  async analyzeQuestions(questions: any[]): Promise<{
    patterns: string[]
    insights: string[]
    tips: string[]
  }> {
    if (!this.ai) {
      throw new Error("Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment variables.")
    }

    const questionsText = questions
      .map((q) => `Subject: ${q.subject}, Topic: ${q.topic}, Difficulty: ${q.difficulty}, Question: ${q.question}`)
      .join("\n\n")

    const prompt = `Analyze the following exam questions and provide insights:

${questionsText}

Please provide:
1. Common patterns you notice across these questions
2. Key insights about the topics and difficulty levels
3. Study tips based on these question types

Format your response as JSON with three arrays: "patterns", "insights", and "tips".`

    try {
      const result = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
      })

      const text = result.text

      try {
        return JSON.parse(text)
      } catch {
        const lines = text.split("\n").filter((line) => line.trim())
        return {
          patterns: lines.slice(0, 3).map((line) => line.replace(/^\d+\.\s*/, "")),
          insights: lines.slice(3, 6).map((line) => line.replace(/^\d+\.\s*/, "")),
          tips: lines.slice(6, 9).map((line) => line.replace(/^\d+\.\s*/, "")),
        }
      }
    } catch (error) {
      console.error("Error analyzing questions:", error)
      throw new Error("Failed to analyze questions. Please try again.")
    }
  }
}

export const geminiService = new GeminiService()
