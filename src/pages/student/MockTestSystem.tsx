"use client"

import type React from "react"
import { useState } from "react"
import { MockTestGenerator } from "./MockTestGenerator"
import { MockTestTaking } from "./MockTestTaking"
import { TestResults } from "../../components/TestResults"
import type { Question } from "../../types"

type TestState = "generator" | "taking" | "results"

interface TestConfig {
  subject: string
  topics: string[]
  difficulty: string[]
  questionTypes: string[]
  questionCount: number
  duration: number
}

export const MockTestSystem: React.FC = () => {
  const [testState, setTestState] = useState<TestState>("generator")
  const [currentTest, setCurrentTest] = useState<{
    questions: Question[]
    config: TestConfig
    answers?: Record<string, string>
    timeSpent?: number
  } | null>(null)

  const handleStartTest = (questions: Question[], config: TestConfig) => {
    setCurrentTest({ questions, config })
    setTestState("taking")
  }

  const handleSubmitTest = (answers: Record<string, string>, timeSpent: number) => {
    if (currentTest) {
      setCurrentTest({ ...currentTest, answers, timeSpent })
      setTestState("results")
    }
  }

  const handleRetakeTest = () => {
    setTestState("taking")
  }

  const handleBackToGenerator = () => {
    setCurrentTest(null)
    setTestState("generator")
  }

  const handleExitTest = () => {
    setCurrentTest(null)
    setTestState("generator")
  }

  return (
    <div>
      {testState === "generator" && <MockTestGenerator onStartTest={handleStartTest} />}

      {testState === "taking" && currentTest && (
        <MockTestTaking
          questions={currentTest.questions}
          duration={currentTest.config.duration}
          onSubmitTest={handleSubmitTest}
          onExitTest={handleExitTest}
        />
      )}

      {testState === "results" && currentTest && currentTest.answers && (
        <TestResults
          questions={currentTest.questions}
          answers={currentTest.answers}
          timeSpent={currentTest.timeSpent || 0}
          onRetakeTest={handleRetakeTest}
          onBackToTests={handleBackToGenerator}
        />
      )}
    </div>
  )
}
