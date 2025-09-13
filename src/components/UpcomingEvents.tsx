import type React from "react"
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline"
import { mockPlannerTasks } from "../data/mockData"

export const UpcomingEvents: React.FC = () => {
  const upcomingTasks = mockPlannerTasks
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
      </div>

      <div className="space-y-3">
        {upcomingTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming events</p>
        ) : (
          upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getTypeIcon(task.type)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{task.subject}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {formatDate(task.dueDate)}
                </p>
                <span className={`text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
