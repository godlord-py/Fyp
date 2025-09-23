"use client"

import { useState } from "react"
import {
  BookmarkIcon,
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid"
import { formatDate, truncateText } from "../utils/helpers"

export const SummaryCard = ({ summary, onDelete, onToggleBookmark, isBookmarked }) => {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onDelete(summary.id)
    setShowDeleteConfirm(false)
  }

  const getDetailLevelColor = (level) => {
    switch (level) {
      case "short":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "detailed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getDetailLevelLabel = (level) => {
    switch (level) {
      case "short":
        return "Short"
      case "medium":
        return "Medium"
      case "detailed":
        return "Detailed"
      default:
        return level
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{summary.title}</h3>

            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <AcademicCapIcon className="w-4 h-4" />
                <span>{summary.subject}</span>
              </div>

              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDate(summary.createdAt)}</span>
              </div>

              <span className={`px-2 py-1 rounded text-xs font-medium ${getDetailLevelColor(summary.detailLevel)}`}>
                {getDetailLevelLabel(summary.detailLevel)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleBookmark(summary.id)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="w-5 h-5 text-yellow-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            {expanded ? summary.content : truncateText(summary.content, 200)}
          </p>

          {summary.content.length > 200 && (
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">{summary.content.split(" ").length} words</div>

          <div className="flex items-center space-x-2">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Export</button>
            <button className="text-sm text-green-600 dark:text-green-400 hover:underline">Share</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Summary?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{summary.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
