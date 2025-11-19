"use client"

import { useState } from "react"
import { PlayIcon, DocumentTextIcon } from "@heroicons/react/24/outline"

export const TestModeSelector = ({ onSelectMode }) => {
  const [selectedMode, setSelectedMode] = useState(null)

  const handleSelect = (mode) => {
    setSelectedMode(mode)
    setTimeout(() => onSelectMode(mode), 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Test Mode</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Select how you'd like to take your test</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Random Mock Test */}
          <button
            onClick={() => handleSelect("random")}
            className={`relative group overflow-hidden rounded-xl transition-all duration-300 ${
              selectedMode === "random" ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"></div>
            <div className="relative p-8 text-white">
              <div className="mb-6 flex justify-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <PlayIcon className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Random Mock Test</h2>
              <p className="text-blue-100 mb-4">Generate a customized test with random questions</p>
              <ul className="text-blue-100 text-sm space-y-2">
                <li>• Choose subject and difficulty</li>
                <li>• Select number of questions</li>
                <li>• Set custom duration</li>
                <li>• Get instant feedback</li>
              </ul>
            </div>
          </button>

          {/* Test Paper */}
          <button
            onClick={() => handleSelect("paper")}
            className={`relative group overflow-hidden rounded-xl transition-all duration-300 ${
              selectedMode === "paper" ? "ring-2 ring-purple-500 scale-105" : "hover:scale-105"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700"></div>
            <div className="relative p-8 text-white">
              <div className="mb-6 flex justify-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <DocumentTextIcon className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Full Test Paper</h2>
              <p className="text-purple-100 mb-4">Take an actual exam paper with real structure</p>
              <ul className="text-purple-100 text-sm space-y-2">
                <li>• Real exam format</li>
                <li>• Fixed question set</li>
                <li>• Standard duration</li>
                <li>• Detailed analysis</li>
              </ul>
            </div>
          </button>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <h3>Tip:</h3> Both modes use AI-powered grading to evaluate your answers intelligently. Subjective
            answers will be graded by Gemini AI for conceptual correctness.
          </p>
        </div>
      </div>
    </div>
  )
}
