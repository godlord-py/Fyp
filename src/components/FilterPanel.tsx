"use client"

import type React from "react"
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline"

interface FilterPanelProps {
  filters: {
    subject: string
    year: string
    topic: string
    difficulty: string
    type: string
    showImportantOnly: boolean
  }
  onFilterChange: (key: string, value: string | boolean) => void
  onClearFilters: () => void
  isOpen: boolean
  onToggle: () => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onToggle,
}) => {
  const subjects = ["All", "Physics", "Chemistry", "Mathematics"]
  const years = ["All", "2023", "2022", "2021", "2020"]
  const topics = [
    "All",
    "Mechanics",
    "Thermodynamics",
    "Optics",
    "Electricity",
    "Organic Chemistry",
    "Physical Chemistry",
    "Inorganic Chemistry",
    "Calculus",
    "Algebra",
    "Trigonometry",
  ]
  const difficulties = ["All", "easy", "medium", "hard"]
  const types = ["All", "mcq", "subjective"]

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FunnelIcon className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {/* Filter Panel */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Clear All
            </button>
            <button onClick={onToggle} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
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

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
            <select
              value={filters.year}
              onChange={(e) => onFilterChange("year", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
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
              {topics.map((topic) => (
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
                  {type === "All" ? "All" : type === "mcq" ? "MCQ" : "Subjective"}
                </option>
              ))}
            </select>
          </div>

          {/* Important Only Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="importantOnly"
              checked={filters.showImportantOnly}
              onChange={(e) => onFilterChange("showImportantOnly", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="importantOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Show important only
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
