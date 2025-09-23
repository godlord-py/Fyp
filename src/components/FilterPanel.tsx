"use client"
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { getSubjectTopics } from "../utils/helpers"

export const FilterPanel = ({
  filters,
  subjects = [],
  sessions = [],
  onFilterChange,
  onClearFilters,
  isOpen,
  onToggle,
}) => {
  const difficulties = ["All", "easy", "medium", "hard"]
  const types = ["All", "mcq", "subjective", "numerical", "true_false"]

  // Get topics based on selected subject
  const availableTopics =
    filters.subject !== "All"
      ? ["All", ...getSubjectTopics(filters.subject)]
      : ["All", "General", "Mechanics", "Thermodynamics", "Optics", "Electricity"]

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <button onClick={onClearFilters} className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Clear All
        </button>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
        <select
          value={filters.subject}
          onChange={(e) => onFilterChange("subject", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Year/Session Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session/Year</label>
        <select
          value={filters.year}
          onChange={(e) => onFilterChange("year", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {sessions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>
      </div>

      {/* Topic Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
        <select
          value={filters.topic}
          onChange={(e) => onFilterChange("topic", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
        <select
          value={filters.difficulty}
          onChange={(e) => onFilterChange("difficulty", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty === "All" ? "All" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Type</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type === "All"
                ? "All"
                : type === "mcq"
                  ? "MCQ"
                  : type === "true_false"
                    ? "True/False"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Important Only Toggle */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showImportantOnly}
            onChange={(e) => onFilterChange("showImportantOnly", e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show important only</span>
        </label>
      </div>
    </div>
  )

  // Mobile filter panel
  if (window.innerWidth < 1024) {
    return (
      <>
        <button
          onClick={onToggle}
          className="lg:hidden w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mb-4"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Filters</span>
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button onClick={onToggle} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop filter panel
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {filterContent}
    </div>
  )
}
