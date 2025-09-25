import type React from "react"
import { Link } from "react-router-dom"

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  to: string
  color?: "blue" | "green" | "purple" | "orange"
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon, to, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800",
    green:
      "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800",
    purple:
      "bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800",
    orange:
      "bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-800",
  }

  return (
    <Link to={to} className={`block p-6 rounded-lg border transition-colors ${colorClasses[color]}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  )
}
