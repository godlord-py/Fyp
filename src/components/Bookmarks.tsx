"use client"

import { useState, useEffect } from "react"
import {
  BookmarkIcon,
  TrashIcon,
  AcademicCapIcon,
  ClockIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"
import { getDifficultyColor, getTypeLabel, truncateText } from "../utils/helpers"
import { bookmarkService, type BookmarkedQuestion } from "../services/bookmark-service"
import { QuestionCard } from "./QuestionCard"

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const loadBookmarks = async () => {
      setLoading(true)
      const saved = bookmarkService.getBookmarks()
      setBookmarks(saved)
      setLoading(false)
    }

    loadBookmarks()
  }, [])

  const handleRemoveBookmark = (questionId: string) => {
    bookmarkService.removeBookmark(questionId)
    setBookmarks((prev) => prev.filter((q) => q.id !== questionId))
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all bookmarks? This action cannot be undone.")) {
      bookmarkService.clearAllBookmarks()
      setBookmarks([])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Bookmarks</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Questions you've bookmarked for later review and practice
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start bookmarking questions from PYQ Explorer to access them here.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Bookmarks: <span className="font-bold text-gray-900 dark:text-white">{bookmarks.length}</span>
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="text-sm px-3 py-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4">
            {bookmarks.map((question) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{question.subject}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{question.subjectCode}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{question.session}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{question.topic}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span className={getDifficultyColor(question.difficulty)}>{question.difficulty}</span>
                      </div>

                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {getTypeLabel(question.type)}
                      </span>

                      <span className="font-medium">{question.marks} marks</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveBookmark(question.id)}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-600 dark:text-red-400"
                    title="Remove bookmark"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Question Content */}
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Q{question.questionNumber}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white leading-relaxed">
                        {expanded[question.id]
                          ? question.questionText
                          : truncateText(question.questionText, 200)}
                      </p>

                      {question.questionText.length > 200 && (
                        <button
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [question.id]: !prev[question.id],
                            }))
                          }
                          className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
                        >
                          {expanded[question.id] ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {question.courseOutcome && <span>CO: {question.courseOutcome}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
