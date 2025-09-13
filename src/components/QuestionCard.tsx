import type React from "react"
import { useState } from "react"
import { StarIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import type { Question } from "../types"

interface QuestionCardProps {
  question: Question
  onToggleImportant: (id: string) => void
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onToggleImportant }) => {
  const [showAnswer, setShowAnswer] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "mcq" ? "🔘" : "✍️"
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(question.type)}</span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{question.subject}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{question.year}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{question.topic}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleImportant(question.id)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
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
        <p className="text-gray-900 dark:text-white font-medium mb-3">{question.questionText}</p>

        {/* MCQ Options */}
        {question.type === "mcq" && question.options && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-2 rounded border ${
                  showAnswer && option === question.correctAnswer
                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <BookOpenIcon className="w-4 h-4 mr-1" />
            {question.type.toUpperCase()}
          </span>
          <span className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            {question.year}
          </span>
        </div>

        {question.type === "mcq" && (
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
        )}
      </div>
    </div>
  )
}
