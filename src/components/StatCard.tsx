import type React from "react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: "blue" | "green" | "purple" | "orange"
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    green: "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700",
    purple:
      "bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    orange:
      "bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-700",
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}
