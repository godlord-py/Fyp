"use client"

import { useState, useMemo, useEffect } from "react"
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { QuestionCard } from "./QuestionCard"
import { FilterPanel } from "../../components/FilterPanel"
import { AIAssistant } from "../../components/AIAssistant"
import { paperAPI } from "../../services/api"
import { createQuestion } from "../../types/index"
import { debounce, handleApiError } from "../../utils/helpers"

export const PYQExplorer = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [filters, setFilters] = useState({
    subject: "All",
    year: "All",
    topic: "All",
    difficulty: "All",
    type: "All",
    showImportantOnly: false,
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)

        // Fetch subjects and sessions for filters
        const [subjectsData, sessionsData] = await Promise.all([paperAPI.getSubjects(), paperAPI.getSessions()])

        setSubjects(["All", ...subjectsData])
        setSessions(["All", ...sessionsData])

        // Fetch initial questions
        await fetchQuestions()
      } catch (err) {
        const errorInfo = handleApiError(err)
        setError(errorInfo.message)
        console.error("Failed to fetch initial data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const fetchQuestions = async (searchTerm = "", filterParams = {}) => {
    try {
      const queryParams = {
        search: searchTerm,
        subject: filterParams.subject !== "All" ? filterParams.subject : undefined,
        session: filterParams.year !== "All" ? filterParams.year : undefined,
        // Add more filter parameters as needed
        limit: 100, // Fetch more questions initially
      }

      const response = await paperAPI.getQuestions(queryParams)
      const formattedQuestions = response.questions.map((q) =>
        createQuestion({
          ...q,
          id: q.id || q._id,
          // Map backend fields to frontend format
          difficulty: q.difficulty || "medium",
          type: q.type || "subjective",
          topic: q.topic || "General",
          tags: q.tags || [],
          isImportant: q.isImportant || false,
        }),
      )

      setQuestions(formattedQuestions)
    } catch (err) {
      const errorInfo = handleApiError(err)
      setError(errorInfo.message)
      console.error("Failed to fetch questions:", err)
    }
  }

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm, filterParams) => {
        fetchQuestions(searchTerm, filterParams)
      }, 500),
    [],
  )

  useEffect(() => {
    if (!loading) {
      debouncedSearch(searchQuery, filters)
    }
  }, [searchQuery, filters, debouncedSearch, loading])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      subject: "All",
      year: "All",
      topic: "All",
      difficulty: "All",
      type: "All",
      showImportantOnly: false,
    })
    setSearchQuery("")
  }

  const handleToggleImportant = (questionId) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, isImportant: !q.isImportant } : q)))
  }

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      // Topic filter (client-side filtering for now)
      if (filters.topic !== "All" && question.topic !== filters.topic) return false

      // Difficulty filter (client-side filtering for now)
      if (filters.difficulty !== "All" && question.difficulty !== filters.difficulty) return false

      // Type filter (client-side filtering for now)
      if (filters.type !== "All" && question.type !== filters.type) return false

      // Important only filter
      if (filters.showImportantOnly && !question.isImportant) return false

      return true
    })
  }, [questions, filters])

  const stats = useMemo(() => {
    const total = filteredQuestions.length
    const important = filteredQuestions.filter((q) => q.isImportant).length
    const byDifficulty = {
      easy: filteredQuestions.filter((q) => q.difficulty === "easy").length,
      medium: filteredQuestions.filter((q) => q.difficulty === "medium").length,
      hard: filteredQuestions.filter((q) => q.difficulty === "hard").length,
    }
    const byType = {
      mcq: filteredQuestions.filter((q) => q.type === "mcq").length,
      subjective: filteredQuestions.filter((q) => q.type === "subjective").length,
    }

    return { total, important, byDifficulty, byType }
  }, [filteredQuestions])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-lg font-medium">Error loading questions</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">PYQ Explorer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and practice previous year questions with smart filtering and AI insights
        </p>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-yellow-600 dark:text-yellow-400">{stats.important}</p>
              <p className="text-gray-500 dark:text-gray-400">Important</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600 dark:text-green-400">{stats.byDifficulty.easy}</p>
              <p className="text-gray-500 dark:text-gray-400">Easy</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-orange-600 dark:text-orange-400">{stats.byDifficulty.medium}</p>
              <p className="text-gray-500 dark:text-gray-400">Medium</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-red-600 dark:text-red-400">{stats.byDifficulty.hard}</p>
              <p className="text-gray-500 dark:text-gray-400">Hard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            subjects={subjects}
            sessions={sessions}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Questions ({filteredQuestions.length})
            </h2>
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or filters to find more questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} onToggleImportant={handleToggleImportant} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant isOpen={showAI} onToggle={() => setShowAI(!showAI)} />
    </div>
  )
}
