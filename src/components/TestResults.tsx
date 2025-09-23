"use client"
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { calculateScore, getDifficultyColor } from "../utils/helpers"

export const TestResults = ({ questions, answers, timeSpent, onRetakeTest, onBackToTests }) => {
  const score = calculateScore(answers, questions)

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B+"
    if (percentage >= 60) return "B"
    if (percentage >= 50) return "C"
    return "F"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test Results</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's how you performed on your mock test</p>
      </div>

      {/* Score Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <TrophyIcon className={`w-16 h-16 ${getScoreColor(score.percentage)}`} />
          </div>
          <h2 className={`text-4xl font-bold ${getScoreColor(score.percentage)} mb-2`}>{score.percentage}%</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Grade: <span className={`font-bold ${getScoreColor(score.percentage)}`}>{getGrade(score.percentage)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{score.correct}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{score.total - score.correct}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{score.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{timeSpent}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minutes</p>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Review</h3>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id] || ""
            const isCorrect = question.type === "mcq" ? userAnswer === question.correctAnswer : userAnswer.trim() !== "" // For subjective, assume correct if answered
            const wasAnswered = userAnswer.trim() !== ""

            return (
              <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Q{index + 1}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{question.subject}</span>
                      <span className={`text-sm ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-sm font-medium">{question.marks} marks</span>
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2">{question.questionText}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {wasAnswered ? (
                      isCorrect ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    )}
                  </div>
                </div>

                {/* Answer Details */}
                <div className="space-y-2 text-sm">
                  {userAnswer && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Your Answer: </span>
                      <span className="text-gray-900 dark:text-white">{userAnswer}</span>
                    </div>
                  )}

                  {question.correctAnswer && question.type === "mcq" && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Correct Answer: </span>
                      <span className="text-green-600 dark:text-green-400">{question.correctAnswer}</span>
                    </div>
                  )}

                  {question.explanation && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Explanation: </span>
                      <span className="text-gray-600 dark:text-gray-400">{question.explanation}</span>
                    </div>
                  )}

                  {!wasAnswered && <div className="text-orange-600 dark:text-orange-400">Not answered</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetakeTest}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Retake Test</span>
        </button>

        <button
          onClick={onBackToTests}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Tests</span>
        </button>
      </div>
    </div>
  )
}
