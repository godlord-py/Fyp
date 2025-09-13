"use client"

import type React from "react"
import { useState } from "react"
import { ClipboardDocumentListIcon, PlayIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { mockQuestions } from "../../data/mockData"
import type { Question } from "../../types"

interface TestConfig {
  subject: string
  topics: string[]
  difficulty: string[]
  questionTypes: string[]
  questionCount: number
  duration: number
}

interface MockTestGeneratorProps {
  onStartTest: (questions: Question[], config: TestConfig) => void
}

export const MockTestGenerator: React.FC<MockTestGeneratorProps> = ({ onStartTest }) => {
  const [config, setConfig] = useState<TestConfig>({
    subject: "All",
    topics: [],
    difficulty: [],
    questionTypes: [],
    questionCount: 10,
    duration: 30,
  })

  const subjects = ["All", "Physics", "Chemistry", "Mathematics"]
  const allTopics = [
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
  const difficulties = ["easy", "medium", "hard"]
  const questionTypes = ["mcq", "subjective"]

  const handleArrayToggle = (key: keyof TestConfig, value: string) => {
    setConfig((prev) => {
      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const generateTest = () => {
    let filteredQuestions = [...mockQuestions]

    // Filter by subject
    if (config.subject !== "All") {
      filteredQuestions = filteredQuestions.filter((q) => q.subject === config.subject)
    }

    // Filter by topics
    if (config.topics.length > 0) {
      filteredQuestions = filteredQuestions.filter((q) => config.topics.includes(q.topic))
    }

    // Filter by difficulty
    if (config.difficulty.length > 0) {
      filteredQuestions = filteredQuestions.filter((q) => config.difficulty.includes(q.difficulty))
    }

    // Filter by question types
    if (config.questionTypes.length > 0) {
      filteredQuestions = filteredQuestions.filter((q) => config.questionTypes.includes(q.type))
    }

    // Shuffle and limit questions
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, Math.min(config.questionCount, shuffled.length))

    if (selectedQuestions.length === 0) {
      alert("No questions match your criteria. Please adjust your filters.")
      return
    }

    onStartTest(selectedQuestions, config)
  }

  const getAvailableQuestions = () => {
    let count = mockQuestions.length

    if (config.subject !== "All") {
      count = mockQuestions.filter((q) => q.subject === config.subject).length
    }

    if (config.topics.length > 0) {
      count = mockQuestions.filter(
        (q) => (config.subject === "All" || q.subject === config.subject) && config.topics.includes(q.topic),
      ).length
    }

    return count
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mock Test Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create customized practice tests with smart filtering and auto-generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Test Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <select
                  value={config.subject}
                  onChange={(e) => setConfig((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.questionCount}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, questionCount: Number.parseInt(e.target.value) || 10 }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={config.duration}
                  onChange={(e) => setConfig((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Filters</h3>

            {/* Topics */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Topics</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allTopics.map((topic) => (
                  <label key={topic} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.topics.includes(topic)}
                      onChange={() => handleArrayToggle("topics", topic)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <label key={difficulty} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.difficulty.includes(difficulty)}
                      onChange={() => handleArrayToggle("difficulty", difficulty)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{difficulty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Question Types</label>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.questionTypes.includes(type)}
                      onChange={() => handleArrayToggle("questionTypes", type)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {type === "mcq" ? "MCQ" : "Subjective"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Generate */}
        <div className="space-y-6">
          {/* Test Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
              Test Preview
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                <span className="font-medium text-gray-900 dark:text-white">{config.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                <span className="font-medium text-gray-900 dark:text-white">{config.questionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">{config.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Available:</span>
                <span className="font-medium text-gray-900 dark:text-white">{getAvailableQuestions()} questions</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {config.topics.length > 0 && (
                  <>
                    <strong>Topics:</strong> {config.topics.join(", ")}
                    <br />
                  </>
                )}
                {config.difficulty.length > 0 && (
                  <>
                    <strong>Difficulty:</strong> {config.difficulty.join(", ")}
                    <br />
                  </>
                )}
                {config.questionTypes.length > 0 && (
                  <>
                    <strong>Types:</strong>{" "}
                    {config.questionTypes.map((t) => (t === "mcq" ? "MCQ" : "Subjective")).join(", ")}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTest}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Generate & Start Test</span>
          </button>
        </div>
      </div>
    </div>
  )
}
