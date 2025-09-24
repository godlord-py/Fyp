import type React from "react"
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline"

export const UpcomingEvents: React.FC = () => {
  // Mock upcoming events - in a real app, this would come from an API
  const upcomingEvents = [
    {
      id: 1,
      title: "Data Structures Quiz",
      date: "2025-01-15",
      time: "10:00 AM",
      type: "quiz",
      color: "blue",
    },
    {
      id: 2,
      title: "Database Systems Assignment Due",
      date: "2025-01-18",
      time: "11:59 PM",
      type: "assignment",
      color: "orange",
    },
    {
      id: 3,
      title: "Algorithms Mock Test",
      date: "2025-01-20",
      time: "2:00 PM",
      type: "test",
      color: "green",
    },
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <ClockIcon className="w-4 h-4" />
      case "assignment":
        return <CalendarIcon className="w-4 h-4" />
      case "test":
        return <CalendarIcon className="w-4 h-4" />
      default:
        return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700"
      case "green":
        return "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700"
      case "orange":
        return "bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-700"
      default:
        return "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <div key={event.id} className={`p-3 rounded-lg border ${getColorClasses(event.color)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getEventIcon(event.type)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {upcomingEvents.length === 0 && (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Your schedule is clear for now</p>
          </div>
        )}
      </div>
    </div>
  )
}
