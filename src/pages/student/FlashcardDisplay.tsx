"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Flashcard } from "../../services/flashcardService"
import { flashcardStorageService, type FlashcardWithSRS } from "../../services/flashcardStorageService"

interface FlashcardDisplayProps {
  flashcards: Flashcard[]
  onBack: () => void
}

export const FlashcardDisplay = ({ flashcards: initialFlashcards, onBack }: FlashcardDisplayProps) => {
  const [cardsWithSRS, setCardsWithSRS] = useState<FlashcardWithSRS[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all")
  const [sessionStats, setSessionStats] = useState({ learned: 0, reviewed: 0 })
  const [showExportImport, setShowExportImport] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loaded = flashcardStorageService.loadFlashcards()
    if (loaded.length === 0) {
      const initialized = flashcardStorageService.initializeFlashcards(initialFlashcards)
      flashcardStorageService.saveFlashcards(initialized)
      setCardsWithSRS(initialized)
    } else {
      setCardsWithSRS(loaded)
    }
  }, [initialFlashcards])

  const filteredCards =
    difficulty === "all" ? cardsWithSRS : cardsWithSRS.filter((card) => card.difficulty === difficulty)

  const displayCards = shuffle ? [...filteredCards].sort(() => Math.random() - 0.5) : filteredCards

  const currentCard = displayCards[currentIndex]
  const progress = Math.round(((currentIndex + 1) / displayCards.length) * 100)
  const isLastCard = currentIndex === displayCards.length - 1
  const isFirstCard = currentIndex === 0

  const handleNext = () => {
    if (currentIndex < displayCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleMarkKnown = async () => {
    if (isProcessing || isLastCard) return

    setIsProcessing(true)
    const updated = flashcardStorageService.updateCardReview(currentCard, 4)
    const newCards = [...cardsWithSRS]
    const cardIndex = newCards.findIndex((c) => c.id === currentCard.id)
    if (cardIndex !== -1) {
      newCards[cardIndex] = updated
      setCardsWithSRS(newCards)
      flashcardStorageService.saveFlashcards(newCards)
      setSessionStats((s) => ({ ...s, learned: s.learned + 1 }))
    }
    setIsProcessing(false)
    handleNext()
  }

  const handleMarkUnknown = async () => {
    if (isProcessing || isLastCard) return

    setIsProcessing(true)
    const updated = flashcardStorageService.updateCardReview(currentCard, 2)
    const newCards = [...cardsWithSRS]
    const cardIndex = newCards.findIndex((c) => c.id === currentCard.id)
    if (cardIndex !== -1) {
      newCards[cardIndex] = updated
      setCardsWithSRS(newCards)
      flashcardStorageService.saveFlashcards(newCards)
      setSessionStats((s) => ({ ...s, reviewed: s.reviewed + 1 }))
    }
    setIsProcessing(false)
    handleNext()
  }

  const handleExportCSV = () => {
    const csv = flashcardStorageService.exportToCSV(cardsWithSRS)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flashcards-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const csv = event.target?.result as string
        const imported = flashcardStorageService.importFromCSV(csv)
        setCardsWithSRS(imported)
        flashcardStorageService.saveFlashcards(imported)
        setShowExportImport(false)
      }
      reader.readAsText(file)
    }
  }

  if (displayCards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-2xl mx-auto">
        <p className="text-gray-600 dark:text-gray-300 mb-4">No flashcards in this category</p>
        <button
          onClick={() => setDifficulty("all")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Show All
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Card {currentIndex + 1} of {displayCards.length}
          </span>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex gap-2 mb-6 flex-wrap justify-between">
        <div className="flex gap-2">
          {["all", "easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level as any)
                setCurrentIndex(0)
                setIsFlipped(false)
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                difficulty === level
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              shuffle ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
          >
            {shuffle ? "Shuffle ON" : "Shuffle"}
          </button>

          <button
            onClick={() => setShowExportImport(!showExportImport)}
            className="px-3 py-1 rounded text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 transition"
          >
            Export/Import
          </button>
        </div>
      </div>

      {/* Export/Import Menu */}
      {showExportImport && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
          >
            Export CSV
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
        </div>
      )}

      {/* Flashcard */}
      <div
        style={{
          perspective: "1000px",
        }}
        className="mb-8 h-96 cursor-pointer"
      >
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
          className="relative w-full h-full"
        >
          {/* Front of card */}
          <div
            style={{
              backfaceVisibility: "hidden",
            }}
            className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 rounded-2xl shadow-2xl p-10 flex flex-col justify-center items-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center w-full h-full flex flex-col justify-center items-center px-6">
              <div className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-widest">Question</div>
              <div className="text-3xl font-bold text-white break-words leading-relaxed">{currentCard.front}</div>
            </div>
            <div className="absolute bottom-4 right-6 text-xs text-white/50 font-medium">Click to flip</div>
          </div>

          {/* Back of card */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-700 dark:to-indigo-800 rounded-2xl shadow-2xl p-10 flex flex-col justify-center items-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center w-full h-full flex flex-col justify-center items-center px-6">
              <div className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-widest">Answer</div>
              <div className="text-3xl font-bold text-white break-words leading-relaxed">{currentCard.back}</div>
              <div className="mt-auto p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentCard.difficulty === "easy"
                      ? "bg-green-400 text-green-900"
                      : currentCard.difficulty === "medium"
                        ? "bg-yellow-400 text-yellow-900"
                        : "bg-red-400 text-red-900"
                  }`}
                >
                  {currentCard.difficulty}
                </span>
              </div>
            </div>
            <div className="absolute bottom-4 right-6 text-xs text-white/50 font-medium">Click to flip</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <button
          onClick={handlePrev}
          disabled={isFirstCard}
          className="px-4 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-white font-semibold rounded-lg transition"
        >
          Previous
        </button>

        <button
          onClick={handleMarkUnknown}
          disabled={isProcessing || isLastCard}
          className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
        >
          {isProcessing ? "Processing..." : "Need Help"}
        </button>

        <button
          onClick={handleMarkKnown}
          disabled={isProcessing || isLastCard}
          className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
        >
          {isProcessing ? "Processing..." : "Got It"}
        </button>

        <button
          onClick={handleNext}
          disabled={isLastCard}
          className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
        >
          Next
        </button>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{sessionStats.learned}</div>
          <div className="text-sm text-green-600 dark:text-green-400">Learned This Session</div>
        </div>
        <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{sessionStats.reviewed}</div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Need Review</div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition"
      >
        Back to Generator
      </button>
    </div>
  )
}
