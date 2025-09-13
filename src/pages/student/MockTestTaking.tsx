import type React from "react"
import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon } from "@heroicons/react/24/outline"
import { TestTimer } from "../../components/TestTimer"
import { TestQuestion } from "../../components/TestQuestion"
import type { Question } from "../../types"

interface MockTestTakingProps {
  questions: Question[]
  duration: number
  onSubmitTest: (answers: Record<string, string>, timeSpent: number) => void
  onExitTest: () => void
}

export const MockTestTaking: React.FC<MockTestTakingProps> = ({ questions, duration, onSubmitTest, onExitTest }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [startTime] = useState(Date.now())
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleTimeUp = () => {
    const timeSpent = Math.round((Date.now() - startTime) / (1000 * 60))
    onSubmitTest(answers, timeSpent)
  }

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTime) / (1000 * 60))
    onSubmitTest(answers, timeSpent)
  }

  const toggleFlag = (questionIndex: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex)
      } else {
        newSet.add(questionIndex)
      }
      return newSet
    })
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((key) => answers[key].trim() !== "").length
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mock Test</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Answered: {getAnsweredCount()}/{questions.length}
            </div>
            <TestTimer duration={duration} onTimeUp={handleTimeUp} isActive={true} />
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Questions</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers[questions[index].id]?.trim() !== ""
              const isCurrent = index === currentQuestion
              const isFlagged = flaggedQuestions.has(index)

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded text-sm font-medium transition-colors relative ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : isAnswered
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {index + 1}
                  {isFlagged && <FlagIcon className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />}
                </button>
              )
            })}
          </div>

          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Not Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Current</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question */}
            <TestQuestion
              question={currentQ}
              questionNumber={currentQuestion + 1}
              selectedAnswer={answers[currentQ.id] || ""}
              onAnswerChange={(answer) => handleAnswerChange(currentQ.id, answer)}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => toggleFlag(currentQuestion)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  flaggedQuestions.has(currentQuestion)
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <FlagIcon className="w-4 h-4" />
                <span>{flaggedQuestions.has(currentQuestion) ? "Unflag" : "Flag"}</span>
              </button>

              <button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === questions.length - 1}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Test?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have answered {getAnsweredCount()} out of {questions.length} questions. Are you sure you want to
              submit?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
