"use client"

import { useState } from "react"
import { CloudArrowUpIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { paperAPI } from "../services/api"
import { validateFile, handleApiError } from "../utils/helpers"

export const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file) => {
    const validation = validateFile(file, ["application/pdf"], 50 * 1024 * 1024) // 50MB limit

    if (!validation.isValid) {
      setError(validation.errors.join(", "))
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadResult(null)
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const result = await paperAPI.uploadPDF(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      setUploadResult(result)
      setSelectedFile(null)
    } catch (err) {
      const errorInfo = handleApiError(err)
      setError(errorInfo.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setError(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Question Papers</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload PDF files of question papers to automatically extract and process questions using OCR
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />

          {!selectedFile ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drop your PDF file here</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">or click to browse and select a file</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Choose File
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <DocumentIcon className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {!uploading && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpload}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Upload & Process
                  </button>
                  <button
                    onClick={resetUpload}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing PDF...</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This may take a few minutes depending on the file size and number of pages...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadResult && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 font-medium">{uploadResult.message}</p>
            </div>

            {uploadResult.savedPapers && uploadResult.savedPapers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Successfully processed {uploadResult.count} paper(s):
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {uploadResult.savedPapers.map((paper, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300">
                      {paper.subject_code} - {paper.questions_found} questions extracted
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={resetUpload}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">Upload Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Upload PDF files containing question papers</li>
            <li>• Files should be clear and readable for best OCR results</li>
            <li>• Maximum file size: 50MB</li>
            <li>• The system will automatically extract questions and metadata</li>
            <li>• Processing time depends on file size and complexity</li>
            <li>• Supported formats: PDF only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
