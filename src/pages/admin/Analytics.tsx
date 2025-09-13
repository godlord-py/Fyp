import type React from "react"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d")

  // Mock analytics data
  const userGrowthData = [
    { month: "Jan", students: 120, admins: 5 },
    { month: "Feb", students: 180, admins: 7 },
    { month: "Mar", students: 240, admins: 8 },
    { month: "Apr", students: 320, admins: 10 },
    { month: "May", students: 450, admins: 12 },
    { month: "Jun", students: 580, admins: 15 },
  ]

  const testPerformanceData = [
    { subject: "Mathematics", avgScore: 78, attempts: 1250 },
    { subject: "Physics", avgScore: 72, attempts: 980 },
    { subject: "Chemistry", avgScore: 81, attempts: 1100 },
    { subject: "Biology", avgScore: 85, attempts: 890 },
    { subject: "English", avgScore: 76, attempts: 750 },
  ]

  const activityData = [
    { name: "PYQ Explorer", value: 35, color: "#3b82f6" },
    { name: "Mock Tests", value: 28, color: "#10b981" },
    { name: "Summaries", value: 22, color: "#f59e0b" },
    { name: "Study Planner", value: 15, color: "#ef4444" },
  ]

  const dailyActiveUsers = [
    { day: "Mon", users: 245 },
    { day: "Tue", users: 289 },
    { day: "Wed", users: 312 },
    { day: "Thu", users: 298 },
    { day: "Fri", users: 356 },
    { day: "Sat", users: 189 },
    { day: "Sun", users: 167 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,247</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12.5% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Taken</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">8,934</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+18.2% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Score</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">78.4%</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">-2.1% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Today</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">342</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+5.8% from yesterday</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="admins" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Usage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Test Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Active Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
