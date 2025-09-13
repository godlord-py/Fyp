import type React from "react"
import { CheckCircleIcon, ClockIcon, FlagIcon } from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid"
import type { PlannerTask } from "../types"

interface TaskCardProps {
  task: PlannerTask
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: PlannerTask) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900"
      case "medium":
        return "border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900"
      case "low":
        return "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900"
      default:
        return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-700 dark:text-red-300"
      case "medium":
        return "text-yellow-700 dark:text-yellow-300"
      case "low":
        return "text-green-700 dark:text-green-300"
      default:
        return "text-gray-700 dark:text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "test":
        return "📝"
      case "revision":
        return "📚"
      case "study":
        return "📖"
      default:
        return "📋"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays < 7) return `${diffDays} days`
    return date.toLocaleDateString()
  }

  const isOverdue = () => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate < today && !task.completed
  }

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${getPriorityColor(task.priority)} ${
        task.completed ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button onClick={() => onToggleComplete(task.id)} className="mt-1 hover:scale-110 transition-transform">
            {task.completed ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-gray-400 hover:text-green-500" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getTypeIcon(task.type)}</span>
              <h3
                className={`font-semibold ${
                  task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
                }`}
              >
                {task.title}
              </h3>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <span className="text-blue-600 dark:text-blue-400">{task.subject}</span>
              <span className={`capitalize font-medium ${getPriorityTextColor(task.priority)}`}>{task.priority}</span>
              <span className="capitalize text-gray-600 dark:text-gray-400">{task.type}</span>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span
                className={`text-sm ${
                  isOverdue() ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {formatDate(task.dueDate)}
              </span>
              {isOverdue() && <FlagIcon className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
