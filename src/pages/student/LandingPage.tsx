"use client"

import type React from "react"
import { SparklesIcon, LightBulbIcon, ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

export const StudentLandingPage: React.FC = () => {
  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: "PYQ Explorer",
      description: "Access thousands of previous year questions organized by subject and difficulty level",
      color: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      href: "/student/pyq",
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: "Mock Tests",
      description: "Practice with realistic mock tests and track your performance over time",
      color: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      href: "/student/mock-test",
    },
    {
      icon: <LightBulbIcon className="w-8 h-8" />,
      title: "AI Summaries",
      description: "Get intelligent summaries of complex topics with our advanced AI technology",
      color: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      href: "/student/summary",
    },
    {
      icon: <CheckCircleIcon className="w-8 h-8" />,
      title: "Smart Study Planner",
      description: "Create personalized study plans and manage your exam preparation efficiently",
      color: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      href: "/student/planner",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">PYQ Explorer</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-2 mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Welcome to Your Success Journey
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Master Your Exams with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent Learning
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Your all-in-one exam preparation platform with PYQ practice, mock tests, AI summaries, and smart study
            planning. Join thousands of students achieving their goals.
          </p>

          {/* Hero Image Placeholder */}
          <div className="rounded-2xl bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 border border-gray-200 dark:border-gray-700">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500">
                <img src="../public/img.png"/>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 border border-gray-200 dark:border-gray-700">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500">
                <img src="../public/img2.png"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Tabs Section */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features for Success</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Everything you need to excel in your exams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <a
                key={index}
                href={feature.href}
                className={`${feature.color} p-8 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}
              >
                <div className={`${feature.textColor} mb-4`}>{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; 2025 PYQ Explorer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
