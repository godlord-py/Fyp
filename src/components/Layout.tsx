"use client"

import type React from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"

export const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const studentNavItems = [
    { path: "/student", icon: HomeIcon, label: "Dashboard" },
    { path: "/student/pyq", icon: BookOpenIcon, label: "PYQ Explorer" },
    { path: "/student/mock-test", icon: ClipboardDocumentListIcon, label: "Mock Tests" },
    { path: "/student/summary", icon: DocumentTextIcon, label: "Summaries" },
    { path: "/student/planner", icon: CalendarIcon, label: "Study Planner" },
    { path: "/student/profile", icon: UserIcon, label: "Profile" },
  ]

  const adminNavItems = [
    { path: "/admin", icon: HomeIcon, label: "Dashboard" },
    { path: "/admin/pyq", icon: BookOpenIcon, label: "Manage PYQs" },
    { path: "/admin/tests", icon: ClipboardDocumentListIcon, label: "Mock Tests" },
    { path: "/admin/analytics", icon: ChartBarIcon, label: "Analytics" },
    { path: "/admin/users", icon: UsersIcon, label: "Users" },
    { path: "/admin/settings", icon: CogIcon, label: "Settings" },
  ]

  const navItems = user?.role === "student" ? studentNavItems : adminNavItems

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">Examind AI</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-semibold">{user?.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
