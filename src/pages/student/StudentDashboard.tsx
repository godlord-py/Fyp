"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { StatCard } from "../../components/StatCard"
import { QuickActionCard } from "../../components/QuickActionCard"
import { UpcomingEvents } from "../../components/UpcomingEvents"
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import { paperAPI } from "../../services/api"
import { handleApiError } from "../../utils/helpers"

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalQuestions: 0,
    completedTests: 0,
    averageScore: 0,
    studyStreak: 0,
    recentTests: [],
    subjectProgress: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        const [questionsResponse, testsResponse] = await Promise.all([
          paperAPI.getQuestions({ limit: 1 }), // Just get count
          paperAPI.getUserTests?.() || Promise.resolve({ tests: [], stats: {} }), // Optional API
        ])

        // Calculate real stats
        const totalQuestions = questionsResponse.total || questionsResponse.questions?.length || 0
        const tests = testsResponse.tests || []
        const completedTests = tests.length
        const averageScore =
          tests.length > 0 ? tests.reduce((acc, test) => acc + (test.score || 0), 0) / tests.length : 0

        // Get subject-wise question counts
        const subjectProgress = {}
        if (user?.subjects) {
          for (const subject of user.subjects) {
            try {
              const subjectQuestions = await paperAPI.getQuestions({
                subject,
                limit: 1,
              })
              subjectProgress[subject] = {
                total: subjectQuestions.total || subjectQuestions.questions?.length || 0,
                completed: Math.floor(Math.random() * 100), // This would come from user progress API
              }
            } catch (err) {
              console.error(`Failed to fetch ${subject} questions:`, err)
              subjectProgress[subject] = { total: 0, completed: 0 }
            }
          }
        }

        setDashboardData({
          totalQuestions,
          completedTests,
          averageScore: Math.round(averageScore),
          studyStreak: 7, // This would come from user activity API
          recentTests: tests.slice(0, 3),
          subjectProgress,
        })
      } catch (err) {
        const errorInfo = handleApiError(err)
        setError(errorInfo.message)
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const syllabusProgress = user?.subjects
    ? Math.round(
        Object.values(dashboardData.subjectProgress).reduce(
          (acc, subject) => acc + (subject.completed / Math.max(subject.total, 1)) * 100,
          0,
        ) / user.subjects.length,
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-blue-100">Ready to continue your learning journey? Let's make today productive!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Syllabus Progress"
          value={`${syllabusProgress}%`}
          subtitle={`${Object.keys(dashboardData.subjectProgress).length} subjects`}
          icon={<AcademicCapIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Tests Completed"
          value={dashboardData.completedTests}
          subtitle={`Avg Score: ${dashboardData.averageScore}%`}
          icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Study Streak"
          value={`${dashboardData.studyStreak} days`}
          subtitle="Keep it up!"
          icon={<FireIcon className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Questions Available"
          value={dashboardData.totalQuestions}
          subtitle="Across all subjects"
          icon={<TrophyIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="PYQ Explorer"
            description="Browse and practice previous year questions"
            icon={<BookOpenIcon className="w-6 h-6" />}
            to="/student/pyq"
            color="blue"
          />
          <QuickActionCard
            title="Mock Tests"
            description="Take practice tests and track progress"
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            to="/student/mock-test"
            color="green"
          />
          <QuickActionCard
            title="AI Summaries"
            description="Generate smart summaries of topics"
            icon={<DocumentTextIcon className="w-6 h-6" />}
            to="/student/summary"
            color="purple"
          />
          <QuickActionCard
            title="Study Planner"
            description="Plan and track your study schedule"
            icon={<CalendarIcon className="w-6 h-6" />}
            to="/student/planner"
            color="orange"
          />
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Performance */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Performance</h3>
            </div>

            <div className="space-y-4">
              {dashboardData.recentTests.length > 0 ? (
                dashboardData.recentTests.map((test, index) => (
                  <div
                    key={test.id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{test.title || `Test ${index + 1}`}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Completed on {new Date(test.completedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{test.score || 0}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{test.timeSpent || 30} min</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No tests completed yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Take your first mock test to see your progress here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <UpcomingEvents />
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(dashboardData.subjectProgress).map(([subject, progress]) => {
            const percentage = Math.round((progress.completed / Math.max(progress.total, 1)) * 100)
            const color = percentage >= 80 ? "green" : percentage >= 60 ? "blue" : "orange"

            return (
              <div key={subject} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{subject}</h4>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      color === "green" ? "bg-green-500" : color === "blue" ? "bg-blue-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.total} questions available</p>
              </div>
            )
          })}

          {Object.keys(dashboardData.subjectProgress).length === 0 && (
            <div className="col-span-3 text-center py-8">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No subjects configured</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Add subjects to your profile to see progress here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
