"use client"

import { useState } from "react"
import { TestModeSelector } from "../../components/TestModeSelector"
import { MockTestGenerator } from "./MockTestGenerator"
import { PaperTestGenerator } from "./PaperTestGenerator"
import { MockTestTaking } from "./MockTestTaking"
import { TestResults } from "../../components/TestResults"
import { createQuestion, createTestConfig } from "../../types/index"

export const MockTestSystem = () => {
  const [testState, setTestState] = useState("modeSelector") // Added initial mode selector state
  const [testMode, setTestMode] = useState(null)
  const [currentTest, setCurrentTest] = useState(null)

  const handleModeSelect = (mode) => {
    setTestMode(mode)
    setTestState("generator")
  }

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
        grading,
      })
      setTestState("results")
    }
  }

  const handleRetakeTest = () => {
    setTestState("taking")
  }

  const handleBackToGenerator = () => {
    setCurrentTest(null)
    setTestMode(null)
    setTestState("modeSelector")
  }

  const handleExitTest = () => {
    setCurrentTest(null)
    setTestMode(null)
    setTestState("modeSelector")
  }

  return (
    <div>
      {testState === "modeSelector" && <TestModeSelector onSelectMode={handleModeSelect} />}

      {testState === "generator" && testMode === "random" && <MockTestGenerator onStartTest={handleStartTest} />}

      {testState === "generator" && testMode === "paper" && <PaperTestGenerator onStartTest={handleStartTest} />}

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
