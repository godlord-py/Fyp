"use client"

import type React from "react"
import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { mockQuestions } from "../../data/mockData"
import type { Question } from "../../types"

export const ManagePYQs: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    subject: "Physics",
    year: new Date().getFullYear(),
    topic: "",
    questionText: "",
    type: "mcq",
    difficulty: "medium",
    options: ["", "", "", ""],
    correctAnswer: "",
    tags: [],
  })

  const subjects = ["All", "Physics", "Chemistry", "Mathematics"]
  const difficulties = ["easy", "medium", "hard"]
  const questionTypes = ["mcq", "subjective"]

  const handleAddQuestion = () => {
    if (!newQuestion.questionText || !newQuestion.topic) return

    const question: Question = {
      id: Date.now().toString(),
      subject: newQuestion.subject!,
      year: newQuestion.year!,
      topic: newQuestion.topic!,
      questionText: newQuestion.questionText!,
      type: newQuestion.type as "mcq" | "subjective",
      difficulty: newQuestion.difficulty as "easy" | "medium" | "hard",
      options: newQuestion.type === "mcq" ? newQuestion.options : undefined,
      correctAnswer: newQuestion.type === "mcq" ? newQuestion.correctAnswer : undefined,
      tags: newQuestion.tags || [],
      isImportant: false,
    }

    setQuestions((prev) => [question, ...prev])
    resetForm()
    setShowAddModal(false)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setNewQuestion({
      ...question,
      options: question.options || ["", "", "", ""],
    })
    setShowAddModal(true)
  }

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !newQuestion.questionText || !newQuestion.topic) return

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              subject: newQuestion.subject!,
              year: newQuestion.year!,
              topic: newQuestion.topic!,
              questionText: newQuestion.questionText!,
              type: newQuestion.type as "mcq" | "subjective",
              difficulty: newQuestion.difficulty as "easy" | "medium" | "hard",
              options: newQuestion.type === "mcq" ? newQuestion.options : undefined,
              correctAnswer: newQuestion.type === "mcq" ? newQuestion.correctAnswer : undefined,
              tags: newQuestion.tags || [],
            }
          : q,
      ),
    )

    resetForm()
    setEditingQuestion(null)
    setShowAddModal(false)
  }

  const handleDeleteQuestion = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    }
  }

  const resetForm = () => {
    setNewQuestion({
      subject: "Physics",
      year: new Date().getFullYear(),
      topic: "",
      questionText: "",
      type: "mcq",
      difficulty: "medium",
      options: ["", "", "", ""],
      correctAnswer: "",
      tags: [],
    })
  }

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSubject = filterSubject === "All" || question.subject === filterSubject

    return matchesSearch && matchesSubject
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage PYQs</h1>
          <p className="text-gray-600 dark:text-gray-400">Add, edit, and organize previous year questions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">{filteredQuestions.length} questions</span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{question.subject}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{question.year}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{question.topic}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                  >
                    {question.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                    {question.type.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-900 dark:text-white font-medium mb-3">{question.questionText}</p>

                {question.type === "mcq" && question.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border text-sm ${
                          option === question.correctAnswer
                            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
                            : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEditQuestion(question)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or add a new question.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <select
                    value={newQuestion.subject || "Physics"}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {subjects
                      .filter((s) => s !== "All")
                      .map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                  <input
                    type="number"
                    min="2000"
                    max="2030"
                    value={newQuestion.year || new Date().getFullYear()}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                  <input
                    type="text"
                    value={newQuestion.topic || ""}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter topic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Text</label>
                <textarea
                  value={newQuestion.questionText || ""}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, questionText: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the question text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={newQuestion.type || "mcq"}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {questionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "mcq" ? "MCQ" : "Subjective"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={newQuestion.difficulty || "medium"}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newQuestion.type === "mcq" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</label>
                  <div className="space-y-2">
                    {(newQuestion.options || ["", "", "", ""]).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(newQuestion.options || ["", "", "", ""])]
                            newOptions[index] = e.target.value
                            setNewQuestion((prev) => ({ ...prev, options: newOptions }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newQuestion.correctAnswer === option}
                          onChange={() => setNewQuestion((prev) => ({ ...prev, correctAnswer: option }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={(newQuestion.tags || []).join(", ")}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., mechanics, kinematics, physics"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingQuestion(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingQuestion ? "Update Question" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
