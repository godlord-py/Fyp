import { useState } from "react"

const GradePredictor = () => {
  const [tae1, setTae1] = useState("")
  const [tae2, setTae2] = useState("")
  const [cae1, setCae1] = useState("")
  const [cae2, setCae2] = useState("")
  const [ese, setEse] = useState("")
  const [showResult, setShowResult] = useState(false)

  const handleInputChange = (value, maxValue, setter) => {
    // Allow empty string for clearing the input
    if (value === "") {
      setter("")
      return
    }

    // Convert to number and validate
    let numValue = Number(value)

    // Reject non-numeric or negative values
    if (isNaN(numValue) || numValue < 0) {
      return
    }

    // Constrain to max value
    if (numValue > maxValue) {
      numValue = maxValue
    }

    setter(numValue.toString())
  }

  const tae1Num = tae1 === "" ? 0 : Number(tae1)
  const tae2Num = tae2 === "" ? 0 : Number(tae2)
  const cae1Num = cae1 === "" ? 0 : Number(cae1)
  const cae2Num = cae2 === "" ? 0 : Number(cae2)
  const eseNum = ese === "" ? 0 : Number(ese)

  // Calculate grades
  const taeAvg = (tae1Num + tae2Num) / 2
  const taeTotal = taeAvg * 2
  const caeAvg = (cae1Num + cae2Num) / 2
  const totalMarks = taeTotal + caeAvg + eseNum
  const percentage = (totalMarks / 75) * 100

  // Meme-based predictions
  const getMemeReaction = () => {
    if (percentage >= 90) {
      return {
        emoji: "🤓",
        title: "TOPPER ENERGY!",
        message: "Bhai aap to IIT material ho! 🚀",
        color: "from-yellow-400 to-amber-500",
      }
    } else if (percentage >= 75) {
      return {
        emoji: "😎",
        title: "SOLID PERFORMANCE!",
        message: "Acha score hai bhai! 💪",
        color: "from-green-400 to-emerald-500",
      }
    } else if (percentage >= 60) {
      return {
        emoji: "🙂",
        title: "DECENT ATTEMPT!",
        message: "Chalega re! Zyada tension mat le! 😅",
        color: "from-blue-400 to-cyan-500",
      }
    } else if (percentage >= 40) {
      return {
        emoji: "😰",
        title: "SURVIVAL MODE!",
        message: "Arre padhai kar le bhai!",
        color: "from-orange-400 to-red-500",
      }
    } else {
      return {
        emoji: "💀",
        title: "RIP MARKS!",
        message: "Next time bilkul fail mat ho! 😵",
        color: "from-red-600 to-pink-600",
      }
    }
  }

  const handleCalculate = () => {
    if (tae1Num === 0 && tae2Num === 0 && cae1Num === 0 && cae2Num === 0 && eseNum === 0) {
      alert("Please enter some marks!")
      return
    }
    setShowResult(true)
  }

  const handleReset = () => {
    setTae1("")
    setTae2("")
    setCae1("")
    setCae2("")
    setEse("")
    setShowResult(false)
  }

  const meme = getMemeReaction()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Grade Predictor
          </h1>
          <p className="text-gray-400 text-lg">See your future! 📊</p>
        </div>

        {/* Main Layout - Vertical Stack on Mobile, Side-by-side on Desktop */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Input Section - Takes 2 columns on desktop */}
          <div className="md:col-span-2 bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-8">Enter Marks</h2>

            <div className="space-y-6">
              {/* TAE Section */}
              <div>
                <label className="block text-blue-400 font-bold mb-4 text-lg">TAE (Total 10 Marks)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">TAE 1 (max 5)</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tae1}
                      onChange={(e) => handleInputChange(e.target.value, 5, setTae1)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-blue-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">TAE 2 (max 5)</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tae2}
                      onChange={(e) => handleInputChange(e.target.value, 5, setTae2)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-blue-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                    />
                  </div>
                </div>
                <p className="text-sm text-blue-300 mt-2">
                  Average: {taeAvg.toFixed(1)} → Out of 10: {taeTotal.toFixed(1)}
                </p>
              </div>

              {/* CAE Section */}
              <div>
                <label className="block text-green-400 font-bold mb-4 text-lg">CAE (Total 15 Marks)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">CAE 1 (max 15)</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cae1}
                      onChange={(e) => handleInputChange(e.target.value, 15, setCae1)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">CAE 2 (max 15)</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cae2}
                      onChange={(e) => handleInputChange(e.target.value, 15, setCae2)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                    />
                  </div>
                </div>
                <p className="text-sm text-green-300 mt-2">Average: {caeAvg.toFixed(1)} (Out of 15)</p>
              </div>

              {/* ESE Section */}
              <div>
                <label className="block text-purple-400 font-bold mb-4 text-lg">ESE (Total 50 Marks)</label>
                <div>
                  <p className="text-sm text-gray-400 mb-2">ESE Score (max 50)</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ese}
                    onChange={(e) => handleInputChange(e.target.value, 50, setEse)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-purple-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-30"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
                >
                  Predict Grade 🚀
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-lg hover:bg-slate-600 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Result Section - Takes 1 column on desktop */}
          {showResult && (
            <div
              className={`bg-gradient-to-br ${meme.color} rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center border-2 border-white md:col-span-1`}
            >
              <div className="text-6xl mb-4">{meme.emoji}</div>
              <h2 className="text-3xl font-black text-white mb-3">{meme.title}</h2>
              <p className="text-base text-white mb-6 font-semibold">{meme.message}</p>

              {/* Score Breakdown */}
              <div className="bg-black bg-opacity-40 rounded-xl p-5 w-full mb-5 border border-white border-opacity-50">
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div>
                    <p className="text-xs text-gray-100 mb-1">TAE</p>
                    <p className="text-xl font-bold text-white">{taeTotal.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-100 mb-1">CAE</p>
                    <p className="text-xl font-bold text-white">{caeAvg.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-100 mb-1">ESE</p>
                    <p className="text-xl font-bold text-white">{eseNum}</p>
                  </div>
                </div>

                <div className="border-t border-white border-opacity-50 pt-3">
                  <p className="text-xs text-gray-100 mb-2">TOTAL</p>
                  <p className="text-3xl font-black text-white">{totalMarks.toFixed(1)}/75</p>
                  <p className="text-2xl font-black text-yellow-300 mt-1">{percentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GradePredictor
