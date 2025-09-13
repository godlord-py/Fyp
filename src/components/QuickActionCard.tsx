"use client"

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
    blue: "hover:bg-blue-50 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-700",
    green: "hover:bg-green-50 dark:hover:bg-green-900 border-green-200 dark:border-green-700",
    purple: "hover:bg-purple-50 dark:hover:bg-purple-900 border-purple-200 dark:border-purple-700",
    orange: "hover:bg-orange-50 dark:hover:bg-orange-900 border-orange-200 dark:border-orange-700",
  }

  const iconColorClasses = {
    blue: "text-blue-600 dark:text-blue-300",
    green: "text-green-600 dark:text-green-300",
    purple: "text-purple-600 dark:text-purple-300",
    orange: "text-orange-600 dark:text-orange-300",
  }

  return (
    <Link
      to={to}
      className={`block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${iconColorClasses[color]}`}>{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  )
}
