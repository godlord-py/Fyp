"use client"

import { useState } from "react"
import { MockTestGenerator } from "./MockTestGenerator"
import { MockTestTaking } from "./MockTestTaking"
import { TestResults } from "../../components/TestResults"
import { createQuestion, createTestConfig } from "../../types/index"

export const MockTestSystem = () => {
  const [testState, setTestState] = useState("generator")
  const [currentTest, setCurrentTest] = useState(null)

  const handleStartTest = (questions, config) => {
    const formattedQuestions = questions.map((q) => createQuestion(q))
    const testConfig = createTestConfig(config)

    setCurrentTest({
      questions: formattedQuestions,
      config: testConfig,
    })
    setTestState("taking")
  }

  const handleSubmitTest = (answers, timeSpent, grading) => {
    if (currentTest) {
      setCurrentTest({
        ...currentTest,
        answers,
        timeSpent,
        grading, // { graded: GradedAnswer[], summary: { correct, total, percentage } }
      })
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
          grading={currentTest.grading}
          onRetakeTest={handleRetakeTest}
          onBackToTests={handleBackToGenerator}
        />
      )}
    </div>
  )
}
