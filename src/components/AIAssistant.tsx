"use client"

import { useState } from "react"
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"
import { geminiService } from "../services/geminiService"

export const AIAssistant = ({ isOpen, onToggle, questions = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content:
        "Hello! I'm your AI study assistant. I can help you understand questions, suggest study strategies, or explain concepts. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      let aiResponse

      if (!geminiService.isConfigured()) {
        aiResponse = {
          id: Date.now() + 1,
          type: "assistant",
          content:
            "I'm sorry, but the AI service is not configured. Please add your VITE_GEMINI_API_KEY to the environment variables to enable AI assistance.",
          timestamp: new Date().toISOString(),
        }
      } else {
        // Check if user is asking for question analysis
        if (
          currentInput.toLowerCase().includes("analyze") ||
          currentInput.toLowerCase().includes("pattern") ||
          currentInput.toLowerCase().includes("insight")
        ) {
          if (questions.length > 0) {
            const analysis = await geminiService.analyzeQuestions(questions.slice(0, 10)) // Analyze first 10 questions
            aiResponse = {
              id: Date.now() + 1,
              type: "assistant",
              content: `Based on your questions, here are my insights:

**Common Patterns:**
${analysis.patterns.map((pattern, i) => `${i + 1}. ${pattern}`).join("\n")}

**Key Insights:**
${analysis.insights.map((insight, i) => `${i + 1}. ${insight}`).join("\n")}

**Study Tips:**
${analysis.tips.map((tip, i) => `${i + 1}. ${tip}`).join("\n")}`,
              timestamp: new Date().toISOString(),
            }
          } else {
            aiResponse = {
              id: Date.now() + 1,
              type: "assistant",
              content:
                "I'd be happy to analyze questions for you, but I don't see any questions loaded. Please browse some questions first, then ask me to analyze them!",
              timestamp: new Date().toISOString(),
            }
          }
        } else {
          // General question - use summarization/general AI
          const response = await geminiService.summarizeText(
            `User question: ${currentInput}\n\nContext: This is a student asking about study-related topics. Please provide a helpful, educational response.`,
          )
          aiResponse = {
            id: Date.now() + 1,
            type: "assistant",
            content: response,
            timestamp: new Date().toISOString(),
          }
        }
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("AI Assistant error:", error)
      const errorResponse = {
        id: Date.now() + 1,
        type: "assistant",
        content:
          "I'm sorry, I encountered an error while processing your request. Please try again or check if the AI service is properly configured.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Study Assistant</h3>
            {!geminiService.isConfigured() && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Not Configured</span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about these questions..."
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
