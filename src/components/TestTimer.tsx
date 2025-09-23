"use client"

import { useState, useEffect } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"
import { formatTimeRemaining } from "../utils/helpers"

export const TestTimer = ({ duration, onTimeUp, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60) // Convert minutes to seconds

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onTimeUp()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, onTimeUp])

  const getTimerColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100
    if (percentage <= 10) return "text-red-600 dark:text-red-400"
    if (percentage <= 25) return "text-orange-600 dark:text-orange-400"
    return "text-gray-900 dark:text-white"
  }

  return (
    <div className={`flex items-center space-x-2 ${getTimerColor()}`}>
      <ClockIcon className="w-5 h-5" />
      <span className="font-mono text-lg font-medium">{formatTimeRemaining(timeLeft)}</span>
    </div>
  )
}
