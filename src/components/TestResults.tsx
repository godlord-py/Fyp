"use client"

export const TestResults = ({ questions, answers, timeSpent, grading, onRetakeTest, onBackToTests }) => {
  const useAI = grading && grading.summary
  const summary = useAI
    ? grading.summary
    : {
        correct: 0,
        total: questions.length,
        percentage: 0,
      }

  const gradedMap: Record<string, { correct: boolean; feedback: string; confidence: number }> = {}
  if (grading && Array.isArray(grading.graded)) {
    grading.graded.forEach((g) => {
      gradedMap[g.id] = { correct: g.correct, feedback: g.feedback, confidence: g.confidence }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Results</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Score: <span className="font-medium">{summary.correct}</span> / {summary.total} (
          <span className="font-medium">{summary.percentage}%</span>) • Time spent: {timeSpent} min
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const user = answers[q.id] || ""
          const res = gradedMap[q.id]
          const isCorrect = res?.correct === true
          return (
            <div
              key={q.id}
              className={`rounded-lg border p-4 ${
                isCorrect
                  ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/30"
                  : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Q{idx + 1}. {q.question}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isCorrect
                      ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Your answer: <span className="font-medium">{user || "(blank)"}</span>
                </p>
                {res?.feedback && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    AI feedback: {res.feedback}{" "}
                    {typeof res.confidence === "number" ? `(conf: ${Math.round(res.confidence * 100)}%)` : ""}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onRetakeTest} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          Retake
        </button>
        <button
          onClick={onBackToTests}
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Generator
        </button>
      </div>
    </div>
  )
}
