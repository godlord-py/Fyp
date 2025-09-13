import type React from "react"
import { useState } from "react"
import { DocumentTextIcon, TrashIcon, ShareIcon, BookmarkIcon } from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid"
import type { Summary } from "../types"

interface SummaryCardProps {
  summary: Summary
  onDelete: (id: string) => void
  onToggleBookmark: (id: string) => void
  isBookmarked?: boolean
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onDelete, onToggleBookmark, isBookmarked }) => {
  const [showFullContent, setShowFullContent] = useState(false)

  const getDetailLevelColor = (level: string) => {
    switch (level) {
      case "short":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "detailed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{summary.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-blue-600 dark:text-blue-400">{summary.subject}</span>
              <span className="text-gray-400">•</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDetailLevelColor(summary.detailLevel)}`}
              >
                {summary.detailLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleBookmark(summary.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isBookmarked ? (
              <BookmarkIconSolid className="w-5 h-5 text-yellow-500" />
            ) : (
              <BookmarkIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ShareIcon className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(summary.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <TrashIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {showFullContent ? summary.content : truncateContent(summary.content)}
        </p>
        {summary.content.length > 200 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 hover:text-blue-800 dark:hover:text-blue-200"
          >
            {showFullContent ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Created {new Date(summary.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            {summary.content.split(" ").length} words • {Math.ceil(summary.content.split(" ").length / 200)} min read
          </span>
        </div>
      </div>
    </div>
  )
}
