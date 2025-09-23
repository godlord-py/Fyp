"use client"
import { Link, useLocation } from "react-router-dom"
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline"

export const Navigation = ({ darkMode, setDarkMode }) => {
  const location = useLocation()

  const navItems = [
    { path: "/explorer", name: "PYQ Explorer", icon: MagnifyingGlassIcon },
    { path: "/mock-test", name: "Mock Tests", icon: ClipboardDocumentListIcon },
    { path: "/summarization", name: "AI Summary", icon: SparklesIcon },
    { path: "/upload", name: "Upload Papers", icon: CloudArrowUpIcon },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              PYQ Platform
            </Link>

            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  )
}
