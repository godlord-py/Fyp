"use client"

import type React from "react"
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
import { mockTestAttempts, mockPlannerTasks, mockQuestions } from "../../data/mockData"

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()

  // Calculate stats from mock data
  const completedTests = mockTestAttempts.length
  const averageScore = mockTestAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / completedTests || 0
  const totalQuestions = mockQuestions.length
  const completedTasks = mockPlannerTasks.filter((task) => task.completed).length
  const totalTasks = mockPlannerTasks.length
  const syllabusProgress = Math.round((completedTasks / totalTasks) * 100)
  const studyStreak = 7 // Mock streak

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
          subtitle={`${completedTasks}/${totalTasks} topics completed`}
          icon={<AcademicCapIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Tests Completed"
          value={completedTests}
          subtitle={`Avg Score: ${Math.round(averageScore)}%`}
          icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Study Streak"
          value={`${studyStreak} days`}
          subtitle="Keep it up!"
          icon={<FireIcon className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Questions Solved"
          value={totalQuestions}
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
              {mockTestAttempts.slice(0, 3).map((attempt) => {
                const test = { title: "Physics Mock Test - Mechanics" } // Mock test data
                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{test.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Completed on {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{attempt.score}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{attempt.timeSpent} min</p>
                    </div>
                  </div>
                )
              })}

              {mockTestAttempts.length === 0 && (
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
          {user?.subjects?.map((subject) => {
            // Mock progress data
            const progress = Math.floor(Math.random() * 100)
            const color = progress >= 80 ? "green" : progress >= 60 ? "blue" : "orange"

            return (
              <div key={subject} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{subject}</h4>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      color === "green" ? "bg-green-500" : color === "blue" ? "bg-blue-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
