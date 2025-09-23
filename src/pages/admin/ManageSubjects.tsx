"use client"

import type React from "react"
import { useState } from "react"
import {
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

interface Subject {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
  questionCount: number
  testCount: number
}

export const ManageSubjects: React.FC = () => {
  // Initial subjects (replacing the hardcoded ones)
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: "1",
      name: "Physics",
      description: "Study of matter, energy, and their interactions",
      color: "blue",
      createdAt: "2024-01-15",
      questionCount: 4,
      testCount: 1,
    },
    {
      id: "2",
      name: "Chemistry",
      description: "Science of matter and chemical reactions",
      color: "green",
      createdAt: "2024-01-15",
      questionCount: 3,
      testCount: 1,
    },
    {
      id: "3",
      name: "Mathematics",
      description: "Study of numbers, structures, and patterns",
      color: "purple",
      createdAt: "2024-01-15",
      questionCount: 3,
      testCount: 0,
    },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
  })

  const colorOptions = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
    { value: "pink", label: "Pink", class: "bg-pink-500" },
    { value: "teal", label: "Teal", class: "bg-teal-500" },
  ]

  const handleAddSubject = () => {
    if (!formData.name.trim() || !formData.description.trim()) return

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      createdAt: new Date().toISOString().split("T")[0],
      questionCount: 0,
      testCount: 0,
    }

    setSubjects((prev) => [...prev, newSubject])
    resetForm()
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      description: subject.description,
      color: subject.color,
    })
    setShowAddModal(true)
  }

  const handleUpdateSubject = () => {
    if (!editingSubject || !formData.name.trim() || !formData.description.trim()) return

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === editingSubject.id
          ? {
              ...subject,
              name: formData.name.trim(),
              description: formData.description.trim(),
              color: formData.color,
            }
          : subject,
      ),
    )
    resetForm()
  }

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id))
    setDeleteConfirm(null)
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "blue" })
    setShowAddModal(false)
    setEditingSubject(null)
  }

  const getColorClass = (color: string, type: "bg" | "text" | "border") => {
    const colorMap = {
      blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200" },
      green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-200" },
      purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-200" },
      orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-200" },
      red: { bg: "bg-red-500", text: "text-red-600", border: "border-red-200" },
      indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-200" },
      pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-200" },
      teal: { bg: "bg-teal-500", text: "text-teal-600", border: "border-teal-200" },
    }
    return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Subjects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add, edit, and organize subjects for your educational platform
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{subjects.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
              <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {subjects.reduce((sum, subject) => sum + subject.questionCount, 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700">
              <BookOpenIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {subjects.reduce((sum, subject) => sum + subject.testCount, 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700">
              <BookOpenIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg ${getColorClass(subject.color, "bg")} flex items-center justify-center`}
                >
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added {new Date(subject.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditSubject(subject)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(subject.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{subject.description}</p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 dark:text-gray-400">{subject.questionCount} questions</span>
                <span className="text-gray-500 dark:text-gray-400">{subject.testCount} tests</span>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClass(subject.color, "text")} ${getColorClass(subject.color, "border")} border bg-opacity-10`}
              >
                {subject.color}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter subject description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                      className={`flex items-center space-x-2 p-2 rounded-md border-2 transition-colors ${
                        formData.color === color.value
                          ? "border-gray-400 dark:border-gray-500"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingSubject ? handleUpdateSubject : handleAddSubject}
                disabled={!formData.name.trim() || !formData.description.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingSubject ? "Update Subject" : "Add Subject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Subject</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this subject? This action cannot be undone and will affect all related
              questions and tests.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubject(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
