"use client"

import { useState } from "react"
import {
  StarIcon,
  ClockIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { geminiService } from "../services/gemini-service"

export const QuestionCard = ({ question, onToggleImportant }) => {
  const [expanded, setExpanded] = useState(false)
  const [generatingAnswer, setGeneratingAnswer] = useState(false)
  const [generatedAnswer, setGeneratedAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "mcq":
        return "📝"
      case "subjective":
        return "✍️"
      case "numerical":
        return "🔢"
      default:
        return "❓"
    }
  }

  const handleGenerateAnswer = async () => {
    if (generatedAnswer) {
      setShowAnswer(!showAnswer)
      return
    }

    setGeneratingAnswer(true)
    try {
      const prompt = `You are an expert ${question.subject} tutor. Provide a comprehensive answer to this question:

Subject: ${question.subject}
Topic: ${question.topic}
Question: ${question.question}

Please provide:
1. A clear, detailed answer
2. Step-by-step explanation if applicable
3. Key concepts involved
4. Any formulas or important points
5. Practical examples if relevant

Make the answer educational and easy to understand for students.`

      const answer = await geminiService.summarizeText(prompt, question.subject, "comprehensive")
      setGeneratedAnswer(answer)
      setShowAnswer(true)
    } catch (error) {
      console.error("Error generating answer:", error)
      setGeneratedAnswer("Sorry, I couldn't generate an answer at the moment. Please try again later.")
      setShowAnswer(true)
    } finally {
      setGeneratingAnswer(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg">{getTypeIcon(question.type)}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty || "Medium"}
            </span>
            {question.marks && <span className="text-sm text-gray-500 dark:text-gray-400">{question.marks} marks</span>}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <AcademicCapIcon className="w-4 h-4" />
              <span>{question.subject}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{question.session || question.year || "N/A"}</span>
            </div>
            {question.topic && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs">
                {question.topic}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggleImportant(question.id)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {question.isImportant ? (
            <StarIconSolid className="w-5 h-5 text-yellow-500" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white leading-relaxed">
          {expanded
            ? question.question
            : question.question.length > 200
              ? `${question.question.substring(0, 200)}...`
              : question.question}
        </p>

        {question.question.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="w-4 h-4" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                <span>Show more</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Generate Answer Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleGenerateAnswer}
          disabled={generatingAnswer}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>
            {generatingAnswer
              ? "Generating..."
              : generatedAnswer
                ? showAnswer
                  ? "Hide Answer"
                  : "Show Answer"
                : "Generate Answer"}
          </span>
        </button>

        {/* Generated Answer */}
        {showAnswer && generatedAnswer && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">AI Generated Answer</span>
            </div>
            <div className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{generatedAnswer}</div>
          </div>
        )}
      </div>
    </div>
  )
}
