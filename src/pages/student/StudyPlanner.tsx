"use client"

import type React from "react"
import { useState } from "react"
import { CalendarIcon, PlusIcon, FunnelIcon } from "@heroicons/react/24/outline"
import { TaskCard } from "../../components/TaskCard"
import { mockPlannerTasks } from "../../data/mockData"
import type { PlannerTask } from "../../types"

export const StudyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>(mockPlannerTasks)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "subject">("dueDate")

  const [newTask, setNewTask] = useState<Partial<PlannerTask>>({
    title: "",
    subject: "Physics",
    type: "study",
    dueDate: "",
    priority: "medium",
    completed: false,
  })

  const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"]
  const taskTypes = ["study", "revision", "test"]
  const priorities = ["low", "medium", "high"]

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) return

    const task: PlannerTask = {
      id: Date.now().toString(),
      title: newTask.title,
      subject: newTask.subject || "Physics",
      type: newTask.type as "study" | "revision" | "test",
      dueDate: newTask.dueDate,
      priority: newTask.priority as "low" | "medium" | "high",
      completed: false,
    }

    setTasks((prev) => [...prev, task])
    setNewTask({
      title: "",
      subject: "Physics",
      type: "study",
      dueDate: "",
      priority: "medium",
      completed: false,
    })
    setShowAddModal(false)
  }

  const handleEditTask = (task: PlannerTask) => {
    setEditingTask(task)
    setNewTask(task)
    setShowAddModal(true)
  }

  const handleUpdateTask = () => {
    if (!editingTask || !newTask.title || !newTask.dueDate) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: newTask.title!,
              subject: newTask.subject!,
              type: newTask.type as "study" | "revision" | "test",
              dueDate: newTask.dueDate!,
              priority: newTask.priority as "low" | "medium" | "high",
            }
          : task,
      ),
    )

    setEditingTask(null)
    setNewTask({
      title: "",
      subject: "Physics",
      type: "study",
      dueDate: "",
      priority: "medium",
      completed: false,
    })
    setShowAddModal(false)
  }

  const handleToggleComplete = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const getFilteredTasks = () => {
    let filtered = [...tasks]

    // Apply filter
    switch (filter) {
      case "pending":
        filtered = filtered.filter((task) => !task.completed)
        break
      case "completed":
        filtered = filtered.filter((task) => task.completed)
        break
      case "overdue":
        filtered = filtered.filter((task) => {
          const today = new Date()
          const dueDate = new Date(task.dueDate)
          return dueDate < today && !task.completed
        })
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "subject":
          return a.subject.localeCompare(b.subject)
        default:
          return 0
      }
    })

    return filtered
  }

  const getStats = () => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = tasks.filter((t) => !t.completed).length
    const overdue = tasks.filter((t) => {
      const today = new Date()
      const dueDate = new Date(t.dueDate)
      return dueDate < today && !t.completed
    }).length

    return { total, completed, pending, overdue }
  }

  const stats = getStats()
  const filteredTasks = getFilteredTasks()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Study Planner</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your study schedule with personalized tasks and progress tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="subject">Sort by Subject</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filter === "all" ? "Create your first study task to get started." : `No ${filter} tasks at the moment.`}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title || ""}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <select
                    value={newTask.subject || "Physics"}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, subject: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={newTask.type || "study"}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {taskTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate || ""}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select
                    value={newTask.priority || "medium"}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingTask(null)
                  setNewTask({
                    title: "",
                    subject: "Physics",
                    type: "study",
                    dueDate: "",
                    priority: "medium",
                    completed: false,
                  })
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleAddTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTask ? "Update Task" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
