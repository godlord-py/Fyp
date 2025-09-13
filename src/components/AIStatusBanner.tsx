"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SparklesIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { geminiService } from "../services/geminiService"

export const AIStatusBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [aiStatus, setAiStatus] = useState<"checking" | "configured" | "missing">("checking")

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        if (geminiService.isConfigured()) {
          setAiStatus("configured")
        } else {
          setAiStatus("missing")
          setIsVisible(true)
        }
      } catch (error) {
        setAiStatus("missing")
        setIsVisible(true)
      }
    }

    // Only check if banner hasn't been dismissed
    const dismissed = localStorage.getItem("ai-setup-banner-dismissed")
    if (!dismissed) {
      checkAIStatus()
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("ai-setup-banner-dismissed", "true")
  }

  const handleSetupClick = () => {
    setShowSetupGuide(true)
  }

  if (!isVisible || aiStatus !== "missing") {
    return null
  }

  return (
    <>
      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">AI Features Not Configured</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Set up your Gemini API key to enable AI-powered summarization and question analysis.
              </p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleSetupClick}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Setup Guide</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </button>
        </div>
      </div>

      <AISetupGuide isOpen={showSetupGuide} onClose={() => setShowSetupGuide(false)} />
    </>
  )
}
