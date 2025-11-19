"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { flashcardStorageService, type FlashcardWithSRS } from "../../services/flashcardStorageService"
import { ChevronDown, Trash2, Download, Upload, RotateCcw } from "lucide-react"

export const FlashcardLibrary = () => {
  const [flashcards, setFlashcards] = useState<FlashcardWithSRS[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [filterState, setFilterState] = useState<"all" | "new" | "learning" | "mastered">("all")

  useEffect(() => {
    loadFlashcards()
  }, [])

  const loadFlashcards = () => {
    const cards = flashcardStorageService.loadFlashcards()
    setFlashcards(cards)
    setLoading(false)
  }

  const subjects = Array.from(new Set(flashcards.map((card) => card.subject)))

  const filteredCards = flashcards.filter((card) => {
    if (selectedSubject && card.subject !== selectedSubject) return false
    if (filterState !== "all" && card.learnState !== filterState) return false
    return true
  })

  const stats = {
    total: flashcards.length,
    new: flashcards.filter((c) => c.learnState === "new").length,
    learning: flashcards.filter((c) => c.learnState === "learning").length,
    mastered: flashcards.filter((c) => c.learnState === "mastered").length,
  }

  const handleDeleteCard = (id: string) => {
    const updated = flashcards.filter((c) => c.id !== id)
    setFlashcards(updated)
    flashcardStorageService.saveFlashcards(updated)
  }

  const handleExportCSV = () => {
    const csv = flashcardStorageService.exportToCSV(filteredCards)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flashcards_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const imported = flashcardStorageService.importFromCSV(csv)
        const updated = [...flashcards, ...imported]
        setFlashcards(updated)
        flashcardStorageService.saveFlashcards(updated)
        alert(`Imported ${imported.length} flashcards successfully!`)
      } catch (error) {
        alert("Error importing CSV: " + String(error))
      }
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete ALL flashcards? This cannot be undone!")) {
      setFlashcards([])
      flashcardStorageService.clearAll()
    }
  }

  const handleResetProgress = (id: string) => {
    const updated = flashcards.map((c) =>
      c.id === id
        ? {
            ...c,
            learnState: "new" as const,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            lastReviewDate: null,
            nextReviewDate: null,
          }
        : c,
    )
    setFlashcards(updated)
    flashcardStorageService.saveFlashcards(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading flashcards...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Flashcard Library</h1>
          <p className="text-gray-400">Manage your saved flashcards and track learning progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Cards</div>
          </div>
          <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.new}</div>
            <div className="text-sm text-gray-400">New</div>
          </div>
          <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-400">{stats.learning}</div>
            <div className="text-sm text-gray-400">Learning</div>
          </div>
          <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">{stats.mastered}</div>
            <div className="text-sm text-gray-400">Mastered</div>
          </div>
          <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">
              {Math.round((stats.mastered / Math.max(stats.total, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Progress</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Subject Filter */}
            <select
              value={selectedSubject || ""}
              onChange={(e) => setSelectedSubject(e.target.value || null)}
              className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {/* Learning State Filter */}
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            >
              <option value="all">All States</option>
              <option value="new">New</option>
              <option value="learning">Learning</option>
              <option value="mastered">Mastered</option>
            </select>

            {/* CHANGE: Added Import/Export/Clear buttons */}
            <div className="ml-auto flex gap-2">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer font-semibold transition">
                <Upload className="w-4 h-4 inline mr-2" />
                Import CSV
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              </label>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export CSV
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Flashcards List */}
        {filteredCards.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <div className="text-2xl font-bold text-gray-400 mb-2">No flashcards found</div>
            <p className="text-gray-500">Generate some flashcards to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition"
              >
                {/* CHANGE: Card header with expand toggle */}
                <div
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-750 transition"
                >
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">{card.front}</div>
                    <div className="flex gap-3 items-center text-sm">
                      <span className="text-gray-400">{card.subject}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          card.difficulty === "easy"
                            ? "bg-green-600/30 text-green-300"
                            : card.difficulty === "medium"
                              ? "bg-yellow-600/30 text-yellow-300"
                              : "bg-red-600/30 text-red-300"
                        }`}
                      >
                        {card.difficulty}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          card.learnState === "new"
                            ? "bg-blue-600/30 text-blue-300"
                            : card.learnState === "learning"
                              ? "bg-orange-600/30 text-orange-300"
                              : card.learnState === "mastered"
                                ? "bg-green-600/30 text-green-300"
                                : "bg-gray-600/30 text-gray-300"
                        }`}
                      >
                        {card.learnState}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition ${expandedCard === card.id ? "rotate-180" : ""}`}
                  />
                </div>

                {/* CHANGE: Expanded card details */}
                {expandedCard === card.id && (
                  <div className="border-t border-gray-700 bg-gray-900/50 p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 font-semibold mb-1">ANSWER</div>
                      <div className="text-gray-300 text-sm leading-relaxed">{card.back}</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs">Repetitions</div>
                        <div className="text-white font-bold">{card.repetitions}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Ease Factor</div>
                        <div className="text-white font-bold">{card.easeFactor.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Interval (days)</div>
                        <div className="text-white font-bold">{card.interval}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Next Review</div>
                        <div className="text-white font-bold">
                          {card.nextReviewDate ? new Date(card.nextReviewDate).toLocaleDateString() : "Today"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700 flex gap-2">
                      <button
                        onClick={() => handleResetProgress(card.id)}
                        className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-semibold transition flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Progress
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
