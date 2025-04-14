import { useEffect, useState } from 'react'

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing game...')

  useEffect(() => {
    const loadingTexts = [
      'Initializing game...',
      'Loading car models...',
      'Preparing race track...',
      'Setting up physics...',
      'Almost ready...'
    ]

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1
        if (newProgress === 20) setLoadingText(loadingTexts[1])
        if (newProgress === 40) setLoadingText(loadingTexts[2])
        if (newProgress === 60) setLoadingText(loadingTexts[3])
        if (newProgress === 80) setLoadingText(loadingTexts[4])
        
        if (newProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-lg mx-auto px-6 py-8 backdrop-blur-sm">
        {/* Loading Animation */}
        <div className="relative mb-12 flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-blue-500/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-purple-500/20 animate-spin-slow" />
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-blue-500 border-l-purple-500 animate-spin" />
        </div>

        {/* Title with Glow */}
        <h2 className="text-5xl font-black text-center mb-6">
          <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            Loading Game
          </span>
        </h2>

        {/* Loading Text with Fade Effect */}
        <div className="h-8 mb-8">
          <p className="text-lg text-gray-300 text-center transition-all duration-500 animate-fade">
            {loadingText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer-fast" />
          </div>
        </div>

        {/* Progress Text */}
        <div className="flex justify-between items-center text-sm text-gray-400 mb-8">
          <span className="font-medium">Loading assets...</span>
          <span className="font-bold text-blue-400">{progress}%</span>
        </div>

        {/* Tips Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center">
              <span className="text-blue-400 font-semibold">TIP:</span> Use arrow keys or WASD to control your car. Press SHIFT for boost!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen

// Add this to your global CSS
const styles = `
@keyframes shimmer-fast {
  0% { transform: translateX(-100%) }
  100% { transform: translateX(100%) }
}

@keyframes spin-slow {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}

.animate-shimmer-fast {
  animation: shimmer-fast 1.5s infinite;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-fade {
  animation: fade 0.5s ease-in-out;
}

@keyframes fade {
  0% { opacity: 0; transform: translateY(10px) }
  100% { opacity: 1; transform: translateY(0) }
}
`

const styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet) 