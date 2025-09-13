import type React from "react"
import { useState, useEffect } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"

interface TestTimerProps {
  duration: number // in minutes
  onTimeUp: () => void
  isActive: boolean
}

export const TestTimer: React.FC<TestTimerProps> = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60) // convert to seconds

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, onTimeUp])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100
    if (percentage <= 10) return "text-red-600 dark:text-red-400"
    if (percentage <= 25) return "text-orange-600 dark:text-orange-400"
    return "text-green-600 dark:text-green-400"
  }

  return (
    <div className="flex items-center space-x-2">
      <ClockIcon className={`w-5 h-5 ${getTimerColor()}`} />
      <span className={`font-mono text-lg font-bold ${getTimerColor()}`}>{formatTime(timeLeft)}</span>
    </div>
  )
}
