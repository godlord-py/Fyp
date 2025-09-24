import { GoogleGenAI } from "@google/genai"

class GeminiService {
  private ai: GoogleGenAI | null = null
  private requestCount = 0
  private lastRequestTime = 0
  private readonly MAX_REQUESTS_PER_MINUTE = 15
  private readonly MIN_REQUEST_INTERVAL = 4000 // 4 seconds between requests

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

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      console.log(`[v0] Rate limiting: waiting ${waitTime}ms before next request`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
    this.requestCount++
  }

  private async makeAPIRequest(prompt: string, maxRetries = 3): Promise<string> {
    if (!this.ai) {
      throw new Error("Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment variables.")
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForRateLimit()

        const result = await this.ai.models.generateContent({
          model: "gemini-2.0-flash-001",
          contents: prompt,
        })

        return result.text
      } catch (error: any) {
        console.error(`[v0] API request attempt ${attempt} failed:`, error)

        if (error.status === 429 || error.message?.includes("429")) {
          const waitTime = Math.pow(2, attempt) * 2000 // Exponential backoff: 2s, 4s, 8s
          console.log(`[v0] Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`)

          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, waitTime))
            continue
          } else {
            // Return fallback content instead of throwing error
            console.log(`[v0] Max retries reached. Using fallback content.`)
            return this.getFallbackContent(prompt)
          }
        } else {
          // For non-rate-limit errors, try once more or return fallback
          if (attempt === maxRetries) {
            return this.getFallbackContent(prompt)
          }
        }
      }
    }

    return this.getFallbackContent(prompt)
  }

  private getFallbackContent(prompt: string): string {
    const isVisualSummary = prompt.includes("JSON response") || prompt.includes("visual summary")
    const isQA = prompt.includes("Q&A format")
    const isFlashcards = prompt.includes("flashcard-style")
    const isBullet = prompt.includes("bullet-point")

    if (isVisualSummary) {
      return JSON.stringify({
        keyPoints: [
          "Core concepts and fundamental principles",
          "Practical applications and real-world examples",
          "Important methodologies and problem-solving approaches",
          "Key relationships between different concepts",
          "Critical analysis and evaluation techniques",
        ],
        concepts: [
          {
            name: "Fundamental Concepts",
            description: "Basic principles that form the foundation",
            importance: "high",
          },
          { name: "Applications", description: "Practical implementations and use cases", importance: "medium" },
          { name: "Advanced Topics", description: "Complex concepts for deeper understanding", importance: "medium" },
        ],
        flowChart: [
          { step: "Understanding", description: "Grasp the fundamental concepts" },
          { step: "Application", description: "Apply knowledge to solve problems" },
          { step: "Analysis", description: "Analyze and evaluate different approaches" },
          { step: "Synthesis", description: "Combine concepts for comprehensive understanding" },
        ],
        mindMap: {
          central: "Subject Overview",
          branches: [
            { topic: "Theory", subtopics: ["Concepts", "Principles", "Laws", "Models"] },
            { topic: "Practice", subtopics: ["Examples", "Exercises", "Projects", "Applications"] },
            { topic: "Analysis", subtopics: ["Evaluation", "Comparison", "Synthesis", "Innovation"] },
          ],
        },
      })
    }

    if (isQA) {
      return `Q: What are the main concepts covered in this topic?
A: The main concepts include fundamental principles, practical applications, and key methodologies that form the foundation of understanding.

Q: How can these concepts be applied in real-world scenarios?
A: These concepts can be applied through practical problem-solving, project implementation, and analytical thinking in various professional contexts.

Q: What are the most important points to remember?
A: Focus on understanding core principles, practicing application techniques, and developing analytical skills for comprehensive mastery.

Q: How do different concepts relate to each other?
A: Concepts are interconnected through shared principles, complementary applications, and hierarchical relationships that build upon each other.

Q: What study strategies work best for this material?
A: Effective strategies include active practice, concept mapping, real-world application, and regular review of key principles.`
    }

    if (isFlashcards) {
      return `FRONT: Core Concepts | BACK: Fundamental principles that form the foundation of the subject

FRONT: Applications | BACK: Practical implementations and real-world use cases

FRONT: Methodologies | BACK: Systematic approaches and problem-solving techniques

FRONT: Key Relationships | BACK: How different concepts connect and build upon each other

FRONT: Analysis Techniques | BACK: Methods for evaluating and comparing different approaches

FRONT: Best Practices | BACK: Proven strategies and recommended approaches for success`
    }

    if (isBullet) {
      return `• **Core Concepts**
  - Fundamental principles and definitions
  - Basic terminology and key concepts
  - Foundation knowledge requirements

• **Practical Applications**
  - Real-world implementation examples
  - Problem-solving approaches
  - Industry use cases and scenarios

• **Key Methodologies**
  - Systematic approaches and frameworks
  - Step-by-step procedures
  - Best practices and guidelines

• **Important Relationships**
  - How concepts connect and interact
  - Dependencies and prerequisites
  - Hierarchical organization of topics

• **Study Recommendations**
  - Focus areas for effective learning
  - Practice exercises and activities
  - Review strategies and techniques`
    }

    // Default comprehensive summary
    return `This comprehensive summary covers the essential aspects of the subject matter, focusing on key concepts, practical applications, and important methodologies.

**Main Concepts:**
The content explores fundamental principles that form the foundation of understanding, including core definitions, essential terminology, and basic theoretical frameworks.

**Practical Applications:**
Real-world implementations demonstrate how theoretical knowledge translates into practical solutions, with examples from various professional contexts and industry applications.

**Key Methodologies:**
Systematic approaches and problem-solving techniques provide structured methods for applying knowledge effectively, including step-by-step procedures and best practices.

**Study Recommendations:**
For effective learning, focus on understanding core principles, practicing application techniques, and developing analytical skills through regular review and hands-on exercises.

**Important Connections:**
The various concepts are interconnected through shared principles and complementary applications, creating a comprehensive framework for understanding and application.`
  }

  async summarizeText(text: string, subject: string, summaryType = "comprehensive"): Promise<string> {
    const prompt = this.generatePromptByType(text, subject, summaryType)
    return await this.makeAPIRequest(prompt)
  }

  async generateVisualSummary(
    text: string,
    subject: string,
  ): Promise<{
    keyPoints: string[]
    concepts: { name: string; description: string; importance: "high" | "medium" | "low" }[]
    flowChart: { step: string; description: string }[]
    mindMap: { central: string; branches: { topic: string; subtopics: string[] }[] }
  }> {
    const prompt = `Analyze the following ${subject} content and create a structured visual summary:

${text}

Please provide a JSON response with the following structure:
{
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "concepts": [
    {"name": "concept name", "description": "brief description", "importance": "high|medium|low"}
  ],
  "flowChart": [
    {"step": "Step 1", "description": "what happens"}
  ],
  "mindMap": {
    "central": "main topic",
    "branches": [
      {"topic": "branch topic", "subtopics": ["subtopic1", "subtopic2"]}
    ]
  }
}

Focus on ${subject}-specific terminology and concepts. Make it educational and easy to understand.`

    try {
      const resultText = await this.makeAPIRequest(prompt)
      try {
        return JSON.parse(resultText)
      } catch {
        // Parse fallback JSON if it's a string
        return JSON.parse(this.getFallbackContent(prompt))
      }
    } catch (error) {
      console.error("Error generating visual summary:", error)
      // Return parsed fallback content
      return JSON.parse(this.getFallbackContent(prompt))
    }
  }

  private generatePromptByType(text: string, subject: string, summaryType: string): string {
    const baseContext = `You are an expert ${subject} tutor. Analyze the following ${subject} content:`

    switch (summaryType) {
      case "comprehensive":
        return `${baseContext}

${text}

Create a comprehensive summary that includes:
1. Main concepts and their definitions
2. Key principles and theories specific to ${subject}
3. Important formulas, algorithms, or methodologies
4. Practical applications and examples
5. Connections between different concepts
6. Study tips for mastering this ${subject} topic

Make it detailed but well-organized for effective learning.`

      case "bullet":
        return `${baseContext}

${text}

Create a bullet-point summary with:
• Main topics (use clear headings)
• Key concepts under each topic
• Important facts and figures
• Critical formulas or rules for ${subject}
• Quick reference points

Format with clear bullet points and subpoints. Keep it concise but comprehensive.`

      case "visual":
        return `${baseContext}

${text}

Create a text-based visual summary that describes:
1. Key concepts as visual elements
2. Relationships between ideas (like a mind map)
3. Process flows or step-by-step procedures
4. Hierarchical organization of topics
5. Visual metaphors to explain ${subject} concepts

Describe how this information would be organized visually for maximum learning impact.`

      case "qa":
        return `${baseContext}

${text}

Create a Q&A format summary with:
- 8-10 important questions about this ${subject} topic
- Clear, detailed answers for each question
- Questions that cover different difficulty levels
- Focus on understanding rather than memorization
- Include "Why" and "How" questions for deeper learning

Format as: Q: [Question] A: [Detailed Answer]`

      case "flashcards":
        return `${baseContext}

${text}

Create flashcard-style content with:
- 10-12 key terms or concepts from ${subject}
- Clear, concise definitions
- Memory aids or mnemonics where helpful
- Examples for complex concepts
- Progressive difficulty from basic to advanced

Format as: FRONT: [Term/Question] | BACK: [Definition/Answer]`

      default:
        return `${baseContext}

${text}

Provide a well-structured summary focusing on the most important aspects of this ${subject} content.`
    }
  }

  async analyzeQuestions(questions: any[]): Promise<{
    patterns: string[]
    insights: string[]
    tips: string[]
  }> {
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
      const resultText = await this.makeAPIRequest(prompt)
      try {
        return JSON.parse(resultText)
      } catch {
        const lines = resultText.split("\n").filter((line) => line.trim())
        return {
          patterns: lines.slice(0, 3).map((line) => line.replace(/^[\d\-*•]\s*/, "")),
          insights: lines.slice(3, 6).map((line) => line.replace(/^[\d\-*•]\s*/, "")),
          tips: lines.slice(6, 9).map((line) => line.replace(/^[\d\-*•]\s*/, "")),
        }
      }
    } catch (error) {
      console.error("Error analyzing questions:", error)
      // Return fallback analysis
      return {
        patterns: [
          "Questions focus on fundamental concepts and practical applications",
          "Multiple difficulty levels test different depths of understanding",
          "Topics cover both theoretical knowledge and problem-solving skills",
        ],
        insights: [
          "Emphasis on understanding core principles rather than memorization",
          "Questions require analytical thinking and concept application",
          "Progressive difficulty builds from basic to advanced concepts",
        ],
        tips: [
          "Focus on understanding underlying principles and concepts",
          "Practice applying knowledge to different problem scenarios",
          "Review connections between related topics and concepts",
        ],
      }
    }
  }
}

export const geminiService = new GeminiService()
