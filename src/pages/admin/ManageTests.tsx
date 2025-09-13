import type React from "react"
import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, PlayIcon } from "@heroicons/react/24/outline"
import { mockTests, mockQuestions } from "../../data/mockData"
import type { Test, Question } from "../../types"

export const ManageTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>(mockTests)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)

  const [newTest, setNewTest] = useState<Partial<Test>>({
    title: "",
    subject: "Physics",
    questions: [],
    duration: 60,
    totalMarks: 100,
  })

  const subjects = ["Physics", "Chemistry", "Mathematics"]

  const handleCreateTest = () => {
    if (!newTest.title || newTest.questions?.length === 0) return

    const test: Test = {
      id: Date.now().toString(),
      title: newTest.title,
      subject: newTest.subject!,
      questions: newTest.questions!,
      duration: newTest.duration!,
      totalMarks: newTest.totalMarks!,
      createdAt: new Date().toISOString(),
    }

    setTests((prev) => [test, ...prev])
    resetForm()
    setShowCreateModal(false)
  }

  const handleEditTest = (test: Test) => {
    setEditingTest(test)
    setNewTest(test)
    setShowCreateModal(true)
  }

  const handleUpdateTest = () => {
    if (!editingTest || !newTest.title || newTest.questions?.length === 0) return

    setTests((prev) =>
      prev.map((t) =>
        t.id === editingTest.id
          ? {
              ...t,
              title: newTest.title!,
              subject: newTest.subject!,
              questions: newTest.questions!,
              duration: newTest.duration!,
              totalMarks: newTest.totalMarks!,
            }
          : t,
      ),
    )

    resetForm()
    setEditingTest(null)
    setShowCreateModal(false)
  }

  const handleDeleteTest = (id: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      setTests((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const resetForm = () => {
    setNewTest({
      title: "",
      subject: "Physics",
      questions: [],
      duration: 60,
      totalMarks: 100,
    })
  }

  const getAvailableQuestions = (subject: string) => {
    return mockQuestions.filter((q) => q.subject === subject)
  }

  const handleQuestionToggle = (question: Question) => {
    const currentQuestions = newTest.questions || []
    const isSelected = currentQuestions.some((q) => q.id === question.id)

    if (isSelected) {
      setNewTest((prev) => ({
        ...prev,
        questions: currentQuestions.filter((q) => q.id !== question.id),
      }))
    } else {
      setNewTest((prev) => ({
        ...prev,
        questions: [...currentQuestions, question],
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Tests</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage mock test templates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Test</span>
        </button>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{test.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400">{test.subject}</span>
                  <span>{test.questions.length} questions</span>
                  <span>{test.duration} min</span>
                  <span>{test.totalMarks} marks</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditTest(test)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTest(test.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Question Types:</span>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
                    {test.questions.filter((q) => q.type === "mcq").length} MCQ
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                    {test.questions.filter((q) => q.type === "subjective").length} Subjective
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                    {test.questions.filter((q) => q.difficulty === "easy").length} Easy
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs">
                    {test.questions.filter((q) => q.difficulty === "medium").length} Medium
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs">
                    {test.questions.filter((q) => q.difficulty === "hard").length} Hard
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(test.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <PlayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tests created yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first mock test template to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Test
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTest ? "Edit Test" : "Create New Test"}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title</label>
                  <input
                    type="text"
                    value={newTest.title || ""}
                    onChange={(e) => setNewTest((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter test title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <select
                      value={newTest.subject || "Physics"}
                      onChange={(e) => {
                        setNewTest((prev) => ({ ...prev, subject: e.target.value, questions: [] }))
                      }}
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
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={newTest.duration || 60}
                      onChange={(e) => setNewTest((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={newTest.totalMarks || 100}
                      onChange={(e) => setNewTest((prev) => ({ ...prev, totalMarks: Number.parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Questions ({(newTest.questions || []).length})
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                    {(newTest.questions || []).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No questions selected</p>
                    ) : (
                      <div className="space-y-2">
                        {(newTest.questions || []).map((question) => (
                          <div
                            key={question.id}
                            className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm"
                          >
                            <span className="truncate">{question.questionText.substring(0, 50)}...</span>
                            <button
                              onClick={() => handleQuestionToggle(question)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Questions ({getAvailableQuestions(newTest.subject || "Physics").length})
                </label>
                <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md">
                  {getAvailableQuestions(newTest.subject || "Physics").map((question) => {
                    const isSelected = (newTest.questions || []).some((q) => q.id === question.id)
                    return (
                      <div
                        key={question.id}
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isSelected ? "bg-blue-50 dark:bg-blue-900" : ""
                        }`}
                        onClick={() => handleQuestionToggle(question)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {question.questionText}
                            </p>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-blue-600 dark:text-blue-400">{question.topic}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">{question.difficulty}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">{question.type.toUpperCase()}</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleQuestionToggle(question)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingTest(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTest ? handleUpdateTest : handleCreateTest}
                disabled={!newTest.title || (newTest.questions || []).length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingTest ? "Update Test" : "Create Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
