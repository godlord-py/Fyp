"use client"

import { useState } from "react"
import { StarIcon, ClockIcon, AcademicCapIcon, TagIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { getDifficultyColor, getTypeLabel, truncateText } from "../../utils/helpers"

export const QuestionCard = ({ question, onToggleImportant }) => {
  const [expanded, setExpanded] = useState(false)

  const handleToggleImportant = () => {
    onToggleImportant(question.id)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
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
          onClick={handleToggleImportant}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {question.isImportant ? (
            <StarIconSolid className="w-5 h-5 text-yellow-500" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Question Content */}
      <div className="mb-4">
        <div className="flex items-start space-x-3 mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            Q{question.questionNumber}
          </span>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {expanded ? question.questionText : truncateText(question.questionText, 200)}
            </p>

            {question.questionText.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        {/* Table Data */}
        {question.tableData && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {question.tableData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Image Description */}
        {question.imageDescription && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Image/Diagram:</strong> {question.imageDescription}
            </p>
          </div>
        )}
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

        <div className="flex items-center space-x-2">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Practice</button>
          <button className="text-sm text-green-600 dark:text-green-400 hover:underline">Add to Test</button>
        </div>
      </div>
    </div>
  )
}
