"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SparklesIcon, ChartBarIcon, LightBulbIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { mockAIInsights } from "../data/mockData"
import { geminiService } from "../services/geminiService"

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState<"patterns" | "insights" | "tips">("patterns")
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAIInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const questions = JSON.parse(localStorage.getItem("currentQuestions") || "[]")

      const insights = await geminiService.analyzeQuestions(questions)

      // Transform the response to match expected format
      const formattedInsights = {
        repeatedQuestions:
          insights.patterns?.map((pattern, index) => ({
            pattern,
            frequency: Math.floor(Math.random() * 40) + 20, // Mock frequency for now
            years: ["2023", "2022", "2021"],
            subjects: [questions[0]?.subject || "General"],
          })) || [],
        twistedQuestions:
          insights.insights?.map((insight, index) => ({
            id: `q${index + 1}`,
            originalConcept: insight.split(" ")[0] || "Concept",
            twist: insight,
            difficulty: "Medium",
          })) || [],
        studyTips:
          insights.tips?.map((tip, index) => ({
            subject: questions[0]?.subject || "General",
            tip,
            priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
          })) || [],
      }

      setAiInsights(formattedInsights)
    } catch (error) {
      console.error("Error fetching AI insights:", error)
      setError(error instanceof Error ? error.message : "Failed to load AI insights")
      setAiInsights(mockAIInsights)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && !aiInsights) {
      fetchAIInsights()
    }
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>
    )
  }

  const insights = aiInsights || mockAIInsights

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>}
        </div>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "patterns", label: "Patterns", icon: ChartBarIcon },
          { id: "insights", label: "Insights", icon: LightBulbIcon },
          { id: "tips", label: "Tips", icon: SparklesIcon },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === "patterns" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Repeated Question Patterns</h4>
            {insights.repeatedQuestions?.map((pattern: any, index: number) => (
              <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-purple-900 dark:text-purple-100">{pattern.pattern}</p>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{pattern.frequency}%</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Appeared in: {pattern.years?.join(", ")}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Subjects: {pattern.subjects?.join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Twisted Questions Alert</h4>
            {insights.twistedQuestions?.map((twist: any, index: number) => (
              <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                <p className="font-medium text-orange-900 dark:text-orange-100 mb-2">Question #{twist.id}</p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                  <strong>Original:</strong> {twist.originalConcept}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                  <strong>Twist:</strong> {twist.twist}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">{twist.difficulty}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tips" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">AI Study Tips</h4>
            <div className="space-y-3">
              {insights.studyTips?.map((tip: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    tip.priority === "high"
                      ? "bg-red-50 dark:bg-red-900"
                      : tip.priority === "medium"
                        ? "bg-yellow-50 dark:bg-yellow-900"
                        : "bg-green-50 dark:bg-green-900"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      tip.priority === "high"
                        ? "text-red-900 dark:text-red-100"
                        : tip.priority === "medium"
                          ? "text-yellow-900 dark:text-yellow-100"
                          : "text-green-900 dark:text-green-100"
                    }`}
                  >
                    <strong>{tip.subject}:</strong> {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
