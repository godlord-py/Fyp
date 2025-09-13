import type React from "react"
import { CheckCircleIcon, XCircleIcon, TrophyIcon } from "@heroicons/react/24/outline"
import type { Question } from "../types"

interface TestResultsProps {
  questions: Question[]
  answers: Record<string, string>
  timeSpent: number
  onRetakeTest: () => void
  onBackToTests: () => void
}

export const TestResults: React.FC<TestResultsProps> = ({
  questions,
  answers,
  timeSpent,
  onRetakeTest,
  onBackToTests,
}) => {
  // Calculate results
  const mcqQuestions = questions.filter((q) => q.type === "mcq")
  const correctAnswers = mcqQuestions.filter((q) => answers[q.id] === q.correctAnswer).length
  const totalMcq = mcqQuestions.length
  const score = totalMcq > 0 ? Math.round((correctAnswers / totalMcq) * 100) : 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return { text: "Excellent!", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    if (score >= 80)
      return { text: "Great Job!", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }
    if (score >= 60)
      return { text: "Good Work!", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
    return { text: "Keep Practicing!", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const badge = getScoreBadge(score)

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Test Completed!</h1>
            <p className="text-blue-100">Here's how you performed</p>
          </div>
          <TrophyIcon className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>{score}%</div>
          <p className="text-gray-600 dark:text-gray-400">Overall Score</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${badge.color}`}>
            {badge.text}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{correctAnswers}</div>
          <p className="text-gray-600 dark:text-gray-400">Correct Answers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{totalMcq - correctAnswers}</div>
          <p className="text-gray-600 dark:text-gray-400">Incorrect Answers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formatTime(timeSpent)}</div>
          <p className="text-gray-600 dark:text-gray-400">Time Spent</p>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question-wise Analysis</h3>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id] || ""
            const isCorrect = question.type === "mcq" ? userAnswer === question.correctAnswer : null

            return (
              <div
                key={question.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {question.type === "mcq" ? (
                      isCorrect ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-500" />
                      )
                    ) : (
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{question.subject}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{question.topic}</span>
                    </div>

                    <p className="text-gray-900 dark:text-white font-medium mb-2">{question.questionText}</p>

                    {question.type === "mcq" && (
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Your answer:</span>{" "}
                          <span
                            className={
                              isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }
                          >
                            {userAnswer || "Not answered"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Correct answer:</span>{" "}
                            <span className="text-green-600 dark:text-green-400">{question.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {question.type === "subjective" && userAnswer && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your answer:</p>
                        <p className="text-gray-900 dark:text-white text-sm">{userAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRetakeTest}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Retake Test
        </button>
        <button
          onClick={onBackToTests}
          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Back to Tests
        </button>
      </div>
    </div>
  )
}
