"use client"

import type React from "react"
import { useState } from "react"
import { MagnifyingGlassIcon, UserIcon, AcademicCapIcon } from "@heroicons/react/24/outline"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  class?: string
  subjects?: string[]
  joinedAt: string
  lastActive: string
  testsCompleted: number
  avgScore: number
}

export const ManageUsers: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: "1",
      name: "John Student",
      email: "student@example.com",
      role: "student",
      class: "12th",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      joinedAt: "2024-01-01",
      lastActive: "2024-01-16",
      testsCompleted: 5,
      avgScore: 85,
    },
    {
      id: "2",
      name: "Jane Admin",
      email: "admin@example.com",
      role: "admin",
      joinedAt: "2024-01-01",
      lastActive: "2024-01-16",
      testsCompleted: 0,
      avgScore: 0,
    },
    {
      id: "3",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "student",
      class: "11th",
      subjects: ["Physics", "Chemistry"],
      joinedAt: "2024-01-05",
      lastActive: "2024-01-15",
      testsCompleted: 3,
      avgScore: 78,
    },
    {
      id: "4",
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "student",
      class: "12th",
      subjects: ["Mathematics", "Physics"],
      joinedAt: "2024-01-10",
      lastActive: "2024-01-14",
      testsCompleted: 7,
      avgScore: 92,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "student" | "admin">("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const getStats = () => {
    const totalUsers = users.length
    const students = users.filter((u) => u.role === "student").length
    const admins = users.filter((u) => u.role === "admin").length
    const activeUsers = users.filter((u) => {
      const lastActive = new Date(u.lastActive)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return lastActive > weekAgo
    }).length

    return { totalUsers, students, admins, activeUsers }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Users</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage student and admin accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.students}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.activeUsers}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active (7 days)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">{filteredUsers.length} users</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Class/Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <UserIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <AcademicCapIcon className="w-3 h-3 mr-1" />
                      )}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === "student" ? (
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">Class {user.class}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.subjects?.join(", ") || "No subjects"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === "student" ? (
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">{user.testsCompleted} tests</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg: {user.avgScore}%</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last active {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
