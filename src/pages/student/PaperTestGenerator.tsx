"use client"

import { useState, useEffect } from "react"
import { DocumentTextIcon, PlayIcon } from "@heroicons/react/24/outline"
import { mockPaperService, type MockPaper } from "../../services/mockPaperService"
import { PaperTestPaper } from "./PaperTestPaper"
import { createQuestion } from "../../types/index"
import { handleApiError } from "../../utils/helpers"
import { geminiService } from "../../services/geminiService"

export const PaperTestGenerator = ({ onStartTest, onExitTest }) => {
  const [mockPapers, setMockPapers] = useState<MockPaper[]>([])
  const [selectedPaper, setSelectedPaper] = useState<MockPaper | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isGrading, setIsGrading] = useState(false)

  useEffect(() => {
    const fetchAndGenerateMockPapers = async () => {
      try {
        setLoading(true)
        const papers = await mockPaperService.generateMockPapers()
        setMockPapers(papers)
      } catch (err) {
        const errorInfo = handleApiError(err)
        setError(errorInfo.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAndGenerateMockPapers()
  }, [])

  const handleStartPaper = (paper: MockPaper) => {
    setSelectedPaper(paper)
  }

  const handleBackFromPaper = () => {
    setSelectedPaper(null)
  }

  const handleSubmitPaper = async (answers: Record<string, string>) => {
    if (!selectedPaper) return

    try {
      setIsGrading(true)
      const questions = selectedPaper.questions || []

      const graded = await geminiService.gradeAnswers(questions, answers)

      const timeSpent = 0 // No timer for papers, just for tracking

      onStartTest(answers, timeSpent, {
        graded,
        summary: {
          correct: graded.filter((g) => g.correct).length,
          total: questions.length,
          percentage:
            questions.length > 0 ? Math.round((graded.filter((g) => g.correct).length / questions.length) * 100) : 0,
        },
        isPaper: true,
        paperTitle: selectedPaper.title,
      })
    } catch (error) {
      console.error("[v0] Error grading paper:", error)
      alert("Error grading paper. Please try again.")
    } finally {
      setIsGrading(false)
    }
  }

  if (selectedPaper) {
    const formattedQuestions = (selectedPaper.questions || []).map((q) =>
      createQuestion({
        ...q,
        id: q.id || q._id,
        difficulty: q.difficulty || "medium",
        type: q.type || "subjective",
        topic: q.course_outcome || "General",
      }),
    )

    return (
      <PaperTestPaper
        mockPaper={selectedPaper}
        questions={formattedQuestions}
        onBack={handleBackFromPaper}
        onSubmitTest={handleSubmitPaper}
      />
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mock Test Papers</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a real mock paper organized by subject - 10 questions per paper, formatted like actual exams
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : mockPapers.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No mock papers available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{paper.title}</h3>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs text-center font-medium py-1 rounded">
                  {paper.subjectName}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{paper.description}</p>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{paper.questions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{paper.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Marks:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{paper.totalMarks}</span>
                </div>
              </div>

              <button
                onClick={() => handleStartPaper(paper)}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Start Paper</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
