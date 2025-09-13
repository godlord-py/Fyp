"use client"

import type React from "react"
import type { Question } from "../types"

interface TestQuestionProps {
  question: Question
  questionNumber: number
  selectedAnswer: string
  onAnswerChange: (answer: string) => void
}

export const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-bold text-sm">
            {questionNumber}
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{question.subject}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{question.topic}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  question.difficulty === "easy"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : question.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {question.difficulty}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                {question.type === "mcq" ? "MCQ" : "Subjective"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <p className="text-gray-900 dark:text-white font-medium text-lg leading-relaxed">{question.questionText}</p>
      </div>

      {/* Answer Options */}
      {question.type === "mcq" && question.options ? (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index)
            const isSelected = selectedAnswer === option

            return (
              <label
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={isSelected}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{optionLetter}.</span>
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer:</label>
          <textarea
            value={selectedAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      )}
    </div>
  )
}
