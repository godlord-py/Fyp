"use client"

import { useState, useEffect } from "react"
import { ClipboardDocumentListIcon, PlayIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { paperAPI } from "../../services/api"
import { createQuestion } from "../../types/index"
import { handleApiError } from "../../utils/helpers"

export const MockTestGenerator = ({ onStartTest }) => {
  const [config, setConfig] = useState({
    subject: "All",
    topics: [],
    questionCount: 10,
    duration: 30,
  })

  const [subjects, setSubjects] = useState(["All"])
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    "Data Structures",
    "Algorithms",
    "Database",
    "Operating Systems",
    "Networks",
  ]

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await paperAPI.getSubjects()
        setSubjects(["All", ...subjectsData])
      } catch (err) {
        console.error("Failed to fetch subjects:", err)
      }
    }

    fetchSubjects()
  }, [])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const queryParams = {
          subject: config.subject !== "All" ? config.subject : undefined,
          limit: 200, // Fetch more questions for test generation
        }

        const response = await paperAPI.getQuestions(queryParams)
        setAvailableQuestions(response.questions || [])
      } catch (err) {
        const errorInfo = handleApiError(err)
        setError(errorInfo.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [config.subject])

  const handleArrayToggle = (key, value) => {
    setConfig((prev) => {
      const currentArray = prev[key]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const generateTest = async () => {
    try {
      setLoading(true)

      let filteredQuestions = [...availableQuestions]

      // Filter by topics (client-side for now)
      if (config.topics.length > 0) {
        filteredQuestions = filteredQuestions.filter((q) =>
          config.topics.some(
            (topic) =>
              q.questionText?.toLowerCase().includes(topic.toLowerCase()) ||
              q.subject?.toLowerCase().includes(topic.toLowerCase()) ||
              q.topic?.toLowerCase().includes(topic.toLowerCase()),
          ),
        )
      }

      if (filteredQuestions.length === 0) {
        alert("No questions match your criteria. Please adjust your filters.")
        return
      }

      // Shuffle and limit questions
      const shuffled = filteredQuestions.sort(() => 0.5 - Math.random())
      const selectedQuestions = shuffled.slice(0, Math.min(config.questionCount, shuffled.length))

      // Format questions properly using actual database fields
      const formattedQuestions = selectedQuestions.map((q) =>
        createQuestion({
          ...q,
          id: q.id || q._id,
          difficulty: q.difficulty || "medium",
          type: q.type || "subjective",
          topic: q.topic || "General",
        }),
      )

      onStartTest(formattedQuestions, config)
    } catch (err) {
      const errorInfo = handleApiError(err)
      setError(errorInfo.message)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableQuestions = () => {
    return availableQuestions.length
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

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

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Topic Filters</h3>

            {/* Topics */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Topics (Optional)
              </label>
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {loading ? "Loading..." : `${getAvailableQuestions()} questions`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {config.topics.length > 0 && (
                  <>
                    <strong>Topics:</strong> {config.topics.join(", ")}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTest}
            disabled={loading || availableQuestions.length === 0}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Loading Questions...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                <span>Generate & Start Test</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
