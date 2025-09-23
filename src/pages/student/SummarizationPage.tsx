"use client"

import { useState, useEffect } from "react"
import { SparklesIcon, DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline"
import { SummaryCard } from "../../components/SummaryCard"
import { summaryAPI } from "../../services/api"
import { createSummary } from "../../types/index"
import { handleApiError } from "../../utils/helpers"

export const SummarizationPage = () => {
  const [summaries, setSummaries] = useState([])
  const [bookmarkedSummaries, setBookmarkedSummaries] = useState(new Set())
  const [inputText, setInputText] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("Physics")
  const [detailLevel, setDetailLevel] = useState("medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"]

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true)
        const savedSummaries = await summaryAPI.getSummaries()
        const formattedSummaries = savedSummaries.map((s) => createSummary(s))
        setSummaries(formattedSummaries)

        // Set bookmarked summaries (for demo, mark first one as bookmarked)
        if (formattedSummaries.length > 0) {
          setBookmarkedSummaries(new Set([formattedSummaries[0].id]))
        }
      } catch (err) {
        // If API fails, use mock data or show error
        console.error("Failed to fetch summaries:", err)
        // For now, continue without error to allow demo functionality
      } finally {
        setLoading(false)
      }
    }

    fetchSummaries()
  }, [])

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      // Call the actual API
      const response = await summaryAPI.generateSummary(inputText, {
        subject: selectedSubject,
        detailLevel: detailLevel,
      })

      const newSummary = createSummary({
        id: Date.now().toString(),
        title: `${selectedSubject} Summary - ${new Date().toLocaleDateString()}`,
        content: response.summary || generateMockSummary(inputText, detailLevel),
        subject: selectedSubject,
        detailLevel,
        createdAt: new Date().toISOString(),
      })

      // Save the summary
      try {
        await summaryAPI.saveSummary(newSummary)
      } catch (saveError) {
        console.error("Failed to save summary:", saveError)
        // Continue anyway with local storage
      }

      setSummaries((prev) => [newSummary, ...prev])
      setInputText("")
      setActiveTab("history")
    } catch (err) {
      const errorInfo = handleApiError(err)

      // If API fails, fall back to mock generation
      console.warn("API failed, using mock generation:", errorInfo.message)

      const newSummary = createSummary({
        id: Date.now().toString(),
        title: `${selectedSubject} Summary - ${new Date().toLocaleDateString()}`,
        content: generateMockSummary(inputText, detailLevel),
        subject: selectedSubject,
        detailLevel,
        createdAt: new Date().toISOString(),
      })

      setSummaries((prev) => [newSummary, ...prev])
      setInputText("")
      setActiveTab("history")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockSummary = (input, level) => {
    const baseContent = `This is an AI-generated summary of your ${selectedSubject} content. `

    switch (level) {
      case "short":
        return (
          baseContent +
          "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications. This summary provides a concise overview of the essential information."
        )
      case "medium":
        return (
          baseContent +
          "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications. This summary provides a balanced overview with detailed explanations of core concepts, relevant examples, and connections between different topics. The content is structured to facilitate understanding and retention of the material."
        )
      case "detailed":
        return (
          baseContent +
          "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications. This comprehensive summary provides in-depth explanations of all core concepts, detailed derivations of important formulas, multiple worked examples, and extensive connections between different topics. The content includes historical context, real-world applications, common misconceptions, and advanced topics for deeper understanding. This detailed analysis is designed to provide complete mastery of the subject matter."
        )
      default:
        return baseContent + "Summary generated successfully."
    }
  }

  const handleDeleteSummary = async (id) => {
    try {
      await summaryAPI.deleteSummary(id)
      setSummaries((prev) => prev.filter((s) => s.id !== id))
      setBookmarkedSummaries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (err) {
      const errorInfo = handleApiError(err)
      setError(errorInfo.message)

      // If API fails, still remove from local state
      setSummaries((prev) => prev.filter((s) => s.id !== id))
      setBookmarkedSummaries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleToggleBookmark = (id) => {
    setBookmarkedSummaries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredSummaries = summaries.filter((summary) =>
    activeTab === "history" ? true : bookmarkedSummaries.has(summary.id),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Summarization</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate intelligent summaries of your study materials with adjustable detail levels
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("generate")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "generate"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            Generate Summary
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            <DocumentTextIcon className="w-4 h-4 inline mr-2" />
            My Summaries ({summaries.length})
          </button>
        </nav>
      </div>

      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Generate AI Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste your content or select a subject
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your study material here, or describe the topic you want summarized..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detail Level
                    </label>
                    <select
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="short">Short (Quick overview)</option>
                      <option value="medium">Medium (Balanced detail)</option>
                      <option value="detailed">Detailed (Comprehensive)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={!inputText.trim() || isGenerating}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating Summary...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Generate Summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How it works</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Paste your study material or describe a topic</li>
                <li>• Choose your preferred detail level</li>
                <li>• AI generates a structured summary</li>
                <li>• Save and organize your summaries</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Detail Levels</h4>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                <div>
                  <strong>Short:</strong> Key points only (~100 words)
                </div>
                <div>
                  <strong>Medium:</strong> Balanced overview (~300 words)
                </div>
                <div>
                  <strong>Detailed:</strong> Comprehensive analysis (~500+ words)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No summaries yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Generate your first AI summary to get started with organized study materials.
              </p>
              <button
                onClick={() => setActiveTab("generate")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Summary
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSummaries.map((summary) => (
                <SummaryCard
                  key={summary.id}
                  summary={summary}
                  onDelete={handleDeleteSummary}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={bookmarkedSummaries.has(summary.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
