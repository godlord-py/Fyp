"use client"

import { useState, useEffect } from "react"
import { generateFlashcards, type Flashcard } from "../../services/flashcardService"
import { FlashcardDisplay } from "./FlashcardDisplay"

export const FlashcardGenerator = ({ paperAPI }) => {
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [numFlashcards, setNumFlashcards] = useState(10)
  const [step, setStep] = useState<"subject" | "preview" | "study">("subject")

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/subjects")
      const data = await response.json()
      setSubjects(data || [])
    } catch (err) {
      console.error("[v0] Error fetching subjects:", err)
      setError("Failed to fetch subjects")
    }
  }

  const fetchQuestions = async (subject: string) => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(
        `http://localhost:5000/api/questions?subject=${encodeURIComponent(subject)}&limit=100`,
      )
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (err) {
      console.error("[v0] Error fetching questions:", err)
      setError("Failed to fetch questions for this subject")
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!selectedSubject || questions.length === 0) {
      setError("Please select a subject with available questions")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Format questions for flashcard generation
      const formattedQuestions = questions.map((q) => ({
        id: q.id || q._id || Math.random().toString(),
        text: q.questionText || q.question_text || "",
        answer: q.answer || "",
        marks: q.marks || 5,
      }))

      const flashcards = await generateFlashcards({
        questions: formattedQuestions,
        subject: selectedSubject,
        numberOfFlashcards: Math.min(numFlashcards, questions.length),
      })

      setGeneratedFlashcards(flashcards)
      setStep("preview")
    } catch (err) {
      console.error("[v0] Error generating flashcards:", err)
      setError(String(err) || "Failed to generate flashcards")
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject)
    setQuestions([])
    setGeneratedFlashcards([])
    setStep("subject")
    fetchQuestions(subject)
  }

  const handleStartStudy = () => {
    if (generatedFlashcards.length > 0) {
      setStep("study")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Flashcard Generator</h1>
          <p className="text-gray-600 dark:text-gray-300">Create AI-powered flashcards from exam questions</p>
        </div>

        {/* Step 1: Subject Selection */}
        {step === "subject" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Select Subject</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">{error}</div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose a subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Subject...</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && questions.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Found <strong>{questions.length}</strong> questions in <strong>{selectedSubject}</strong>
                </p>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate:</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.min(50, questions.length)}
                    value={numFlashcards}
                    onChange={(e) =>
                      setNumFlashcards(Math.min(Math.max(1, Number.parseInt(e.target.value) || 1), questions.length))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">flashcards</span>
                </div>
              </div>
            )}

            {selectedSubject && questions.length === 0 && !loading && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded">
                No questions found for this subject
              </div>
            )}

            <button
              onClick={handleGenerateFlashcards}
              disabled={!selectedSubject || questions.length === 0 || loading}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {loading ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>
        )}

        {/* Step 2: Preview Generated Flashcards */}
        {step === "preview" && generatedFlashcards.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Generated Flashcards</h2>
                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-lg">
                  {generatedFlashcards.length} cards
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {generatedFlashcards.map((card, index) => (
                  <div
                    key={index}
                    className="p-6 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 hover:shadow-lg transition"
                  >
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-widest">
                      Card {index + 1}
                    </div>

                    {/* Front - Concept/Hint */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">CONCEPT</div>
                      <div className="font-bold text-lg text-gray-800 dark:text-white">{card.front}</div>
                    </div>

                    {/* Back - Answer */}
                    <div className="mb-4 pb-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 mt-3">ANSWER</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{card.back}</div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          card.difficulty === "easy"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : card.difficulty === "medium"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {card.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("subject")}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={handleStartStudy}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  Start Studying
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Study Mode */}
        {step === "study" && <FlashcardDisplay flashcards={generatedFlashcards} onBack={() => setStep("preview")} />}
      </div>
    </div>
  )
}
