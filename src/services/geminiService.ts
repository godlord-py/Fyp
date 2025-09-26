/**
 * GeminiService handles all interactions with the Google Gemini API.
 * It is responsible for generating summaries, creating structured visual data,
 * and analyzing questions by sending formatted prompts to the AI model.
 *
 * This service uses the standard `fetch` API for requests and includes
 * robust error handling with exponential backoff for retries, ensuring
 * resilience against network issues and rate limiting.
 */
class GeminiService {
  // Use the recommended Gemini Flash model for speed and capability.
  private readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
  private apiKey: string | null = null;

  constructor() {
    // It's safer to access environment variables directly within the class.
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  /**
   * Checks if the Gemini API key is provided in the environment variables.
   * @returns {boolean} True if the API key is configured.
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * The core method for making requests to the Gemini API.
   * It includes robust error handling and an exponential backoff retry mechanism.
   * @param {string} prompt - The complete prompt to send to the model.
   * @param {number} maxRetries - The maximum number of times to retry on failure.
   * @returns {Promise<string>} The text content from the API response.
   */
  private async makeAPIRequest(prompt: string, maxRetries = 3): Promise<string> {
    if (!this.isConfigured()) {
      console.error("[v1] Gemini API key is not configured.");
      // Return fallback content immediately if not configured.
      return this.getFallbackContent(prompt);
    }

    const fullApiUrl = `${this.API_URL}?key=${this.apiKey}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(fullApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
          }),
        });

        if (!response.ok) {
          // Handle non-successful HTTP statuses
          if (response.status === 429 && attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.warn(`[v1] Rate limited. Retrying attempt ${attempt} in ${Math.round(waitTime / 1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry the request
          }
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error("Invalid response structure from API.");
        }

        return text;

      } catch (error) {
        console.error(`[v1] API request attempt ${attempt} failed:`, error);
        if (attempt >= maxRetries) {
          console.warn("[v1] Max retries reached. Using fallback content.");
          return this.getFallbackContent(prompt);
        }
      }
    }

    // This part should ideally not be reached, but serves as a final fallback.
    return this.getFallbackContent(prompt);
  }

  /**
   * Generates a text-based summary based on the specified type.
   * @param {string} text - The input text to summarize.
   * @param {string} subject - The academic subject of the text.
   * @param {string} summaryType - The desired format (e.g., 'comprehensive', 'bullet').
   * @returns {Promise<string>} A Markdown-formatted summary string.
   */
  async summarizeText(text: string, subject: string, summaryType = "comprehensive"): Promise<string> {
    const prompt = this.generatePromptByType(text, subject, summaryType);
    return this.makeAPIRequest(prompt);
  }

  /**
   * Generates a structured JSON object for a visual summary.
   * @param {string} text - The input text.
   * @param {string} subject - The academic subject.
   * @returns {Promise<object>} A JSON object representing the visual summary.
   */
  async generateVisualSummary(text: string, subject: string): Promise<object> {
    const prompt = `
      Analyze the following content on the subject of "${subject}" and generate a structured summary.

      **Content to analyze:**
      ${text}

      **Instructions:**
      Provide a valid JSON response with the following structure. Do not include any text or markdown formatting outside of the JSON object.
      {
        "keyPoints": ["A concise key takeaway", "Another important point", "...", "Final key point"],
        "concepts": [
          {"name": "Concept Name", "description": "A brief, clear description of the concept.", "importance": "high|medium|low"}
        ],
        "flowChart": [
          {"step": "Step 1 Title", "description": "Description of what happens in the first step."}
        ],
        "mindMap": {
          "central": "The Core Topic",
          "branches": [
            {"topic": "Main Branch 1", "subtopics": ["Sub-topic 1a", "Sub-topic 1b"]}
          ]
        }
      }
    `;

    const resultText = await this.makeAPIRequest(prompt);
    try {
        // Clean up the response to ensure it's valid JSON
        const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("[v1] Failed to parse JSON from visual summary response. Using fallback.", error);
        // The fallback content for visual summaries is already a valid JSON string.
        return JSON.parse(this.getFallbackContent('visual summary'));
    }
  }


  /**
   * Generates a specific prompt based on the desired summary type.
   * **This is where we instruct the AI on formatting.**
   * @param {string} text - The input text.
   * @param {string} subject - The academic subject.
   * @param {string} summaryType - The summary format.
   * @returns {string} The fully constructed prompt.
   */
  private generatePromptByType(text: string, subject: string, summaryType: string): string {
    const baseInstruction = `
      You are an expert academic assistant specializing in **${subject}**.
      Analyze the provided text and generate a summary based on the following format and rules.

      **Formatting Rules:**
      - The entire response MUST be in GitHub Flavored Markdown.
      - Use headings (##, ###), bold text (**term**), and bullet points (-) for clarity.
      - For all mathematical formulas or equations, use LaTeX syntax enclosed in '$$' delimiters (e.g., $$ E = mc^2 $$).
      - If a comparison is useful, create a Markdown table.

      **Text to Analyze:**
      ---
      ${text}
      ---
    `;

    switch (summaryType) {
      case "comprehensive":
        return `${baseInstruction}\n**Task:** Create a detailed, comprehensive summary. It should include main concepts, key principles, practical examples, and a concluding overview. Structure it like a high-quality study guide.`;

      case "bullet":
        return `${baseInstruction}\n**Task:** Create a concise summary using nested bullet points. Use bold text for main topics and indented bullets for key details underneath them.`;

      case "qa":
        return `${baseInstruction}\n**Task:** Create a summary in a Question & Answer format. Generate 5-7 insightful questions that cover the core material, followed by clear, accurate answers. Format as:\n### Question Title\n**Q:** [Question]\n**A:** [Answer]`;

      case "flashcards":
        return `${baseInstruction}\n**Task:** Create content for study flashcards. Format this as a Markdown table with two columns: "Front (Term/Question)" and "Back (Definition/Answer)". Include 5-8 important terms.`;
      
      // Note: 'visual' type is handled by generateVisualSummary, this case is a fallback.
      case "visual":
          return `${baseInstruction}\n**Task:** Describe the key concepts and their relationships in a structured way that could be turned into a mind map or flowchart. Use headings and bullet points to show hierarchy.`;
          
      default:
        return `${baseInstruction}\n**Task:** Provide a standard, well-structured summary focusing on the most important aspects of the content.`;
    }
  }

  /**
   * Provides fallback content when the API fails, formatted in Markdown.
   * @param {string} prompt - The original prompt, used to determine the fallback type.
   * @returns {string} A Markdown-formatted fallback string.
   */
  private getFallbackContent(prompt: string): string {
    if (prompt.includes('"keyPoints"')) { // Check for visual summary JSON prompt
        return JSON.stringify({
            keyPoints: ["Fallback: Unable to connect to AI service.", "Core concepts could not be analyzed.", "Please check your API key and network connection."],
            concepts: [{ name: "Connection Error", description: "The service failed to retrieve data from the Gemini API.", importance: "high" }],
            flowChart: [{ step: "Error", description: "API request failed after multiple retries." }],
            mindMap: { central: "Service Failure", branches: [{ topic: "Troubleshooting", subtopics: ["Check VITE_GEMINI_API_KEY", "Verify internet connection"] }] }
        });
    }

    if (prompt.includes("Q&A format")) {
        return `
          ### Fallback Summary
          **Q:** What happened?
          **A:** The AI summary could not be generated due to a connection issue with the API.

          **Q:** What should I do?
          **A:** Please verify your internet connection and ensure the Gemini API key is correctly configured in your environment variables.
        `;
    }

    // Default Markdown fallback
    return `
      ##  Offline Summary (Fallback)
      
      There was an issue connecting to the AI summarization service. Please check your network connection and API key configuration.
      
      ### Key Areas to Review Manually:
      - Identify the **core arguments** or main ideas in your text.
      - List out key **terminology** and their definitions.
      - Note any **formulas or important data** presented.
    `;
  }
}

// Export a singleton instance of the service.
export const geminiService = new GeminiService();
