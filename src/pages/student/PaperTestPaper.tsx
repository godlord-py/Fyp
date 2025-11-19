"use client"

import { useState } from "react"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export const PaperTestPaper = ({ mockPaper, questions, onBack, onSubmitTest }) => {
  const [answers, setAnswers] = useState({})
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((key) => answers[key] && answers[key].toString().trim() !== "").length
  }

  const handleSubmit = () => {
    onSubmitTest(answers)
    setShowSubmitConfirm(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Header Bar */}
      <div className="bg-white border-b-2 border-gray-300 px-6 py-4 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="border-l-2 border-gray-300 pl-4">
              <h1 className="text-lg font-bold text-gray-900">{mockPaper.title}</h1>
              <p className="text-sm text-gray-600">{mockPaper.subject}</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded border border-gray-300">
            Answered:{" "}
            <span className="font-bold text-gray-900">
              {getAnsweredCount()}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-white shadow-2xl border-2 border-gray-300"
          style={{ minHeight: "297mm" }}
          id="paper-content"
        >
          {/* Double Border Header */}
          <div className="border-4 border-double border-gray-800 m-8">
            <div className="border border-gray-800 p-6">
              {/* Top Header */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-widest mb-4">MOCK EXAMINATION</h1>
                <div className="w-32 h-0.5 bg-gray-800 mx-auto"></div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm border-t-2 border-b-2 border-gray-800 py-4 my-4">
                <div className="border-r border-gray-400 pr-4">
                  <p className="font-semibold text-gray-900">Total Marks: {mockPaper.totalMarks || 50}</p>
                </div>
                <div className="pl-4">
                  <p className="font-semibold text-gray-900 text-right">Questions: {questions.length}</p>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="bg-gray-50 border border-gray-400 p-4 mb-6">
                <p className="text-xs font-semibold text-gray-800 mb-2">INSTRUCTIONS:</p>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  <li>Answer all questions in the spaces provided</li>
                  <li>Show all your working clearly</li>
                  <li>Marks are indicated against each question</li>
                </ul>
              </div>
            
          </div>

          {/* Questions Section */}
          <div className="px-12 pb-12 space-y-1">
            {questions.map((question, index) => (
              <div key={question.id || index} className="border-l-4 border-gray-300 pl-6 py-2">
                <div className="flex gap-4">
                  <span className="font-bold text-xl text-gray-900 flex-shrink-0 min-w-[2rem]">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-900 leading-loose text-base mb-3">{question.questionText}</p>
                    <div className="flex items-center justify-end">
                
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Section */}
          <div className="border-t-2 border-gray-800 mx-12 mb-12 pt-6">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <p>* End of Question Paper *</p>
              <p className="italic">Page 1 of 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Paper?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You have answered <span className="font-bold text-gray-900">{getAnsweredCount()}</span> out of{" "}
              <span className="font-bold text-gray-900">{questions.length}</span> questions. Do you want to submit for grading?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Continue Writing
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}