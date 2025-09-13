import type React from "react"
import { useState } from "react"
import {
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import { mockQuestions, mockTests, mockTestAttempts } from "../../data/mockData"

export const AdminDashboard: React.FC = () => {
  // Mock admin data
  const [stats] = useState({
    totalUsers: 1247,
    totalQuestions: mockQuestions.length,
    totalTests: mockTests.length,
    totalAttempts: mockTestAttempts.length,
    activeUsers: 89,
    newUsersThisWeek: 23,
  })

  const [recentActivity] = useState([
    { id: 1, type: "user_signup", message: "New student registered: John Doe", time: "2 minutes ago" },
    { id: 2, type: "test_completed", message: "Physics Mock Test completed by 15 students", time: "5 minutes ago" },
    { id: 3, type: "question_added", message: "5 new Chemistry questions added", time: "1 hour ago" },
    { id: 4, type: "test_created", message: "Mathematics Practice Test created", time: "2 hours ago" },
    { id: 5, type: "user_signup", message: "New student registered: Jane Smith", time: "3 hours ago" },
  ])

  const [subjectStats] = useState([
    { subject: "Physics", questions: 4, tests: 1, avgScore: 78 },
    { subject: "Chemistry", questions: 3, tests: 1, avgScore: 82 },
    { subject: "Mathematics", questions: 3, tests: 0, avgScore: 75 },
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <UsersIcon className="w-4 h-4 text-green-500" />
      case "test_completed":
        return <ClipboardDocumentListIcon className="w-4 h-4 text-blue-500" />
      case "question_added":
        return <BookOpenIcon className="w-4 h-4 text-purple-500" />
      case "test_created":
        return <ChartBarIcon className="w-4 h-4 text-orange-500" />
      default:
        return <EyeIcon className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of platform activity, user engagement, and content management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+{stats.newUsersThisWeek} this week</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalQuestions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all subjects</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700">
              <BookOpenIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mock Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalTests}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active templates</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700">
              <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeUsers}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Online now</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700">
              <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Overview */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Overview</h3>
            <div className="space-y-4">
              {subjectStats.map((subject) => (
                <div key={subject.subject} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{subject.subject}</h4>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{subject.avgScore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{subject.questions} questions</span>
                    <span>{subject.tests} tests</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${subject.avgScore}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
            <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            <span className="font-medium text-blue-900 dark:text-blue-100">Add Questions</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
            <ClipboardDocumentListIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            <span className="font-medium text-green-900 dark:text-green-100">Create Test</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
            <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            <span className="font-medium text-purple-900 dark:text-purple-100">View Analytics</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors">
            <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            <span className="font-medium text-orange-900 dark:text-orange-100">Manage Users</span>
          </button>
        </div>
      </div>
    </div>
  )
}
