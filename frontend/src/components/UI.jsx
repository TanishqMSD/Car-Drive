import { useGame } from '../hooks/useGame'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UI() {
  const { score, boostActive, gameOver, gameTime } = useGame()
  const [displayScore, setDisplayScore] = useState(0)
  const [boostProgress, setBoostProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < score) return prev + 1
        if (prev > score) return prev - 1
        return prev
      })
    }, 50)
    return () => clearInterval(interval)
  }, [score])

  useEffect(() => {
    if (boostActive) {
      setBoostProgress(100)
      const interval = setInterval(() => {
        setBoostProgress(prev => Math.max(0, prev - 3.33))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setBoostProgress(100)
    }
  }, [boostActive])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 p-6 text-white backdrop-blur-md bg-gradient-to-br from-black/40 to-black/20 rounded-2xl border border-white/20 shadow-2xl"
      >
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">Car Game</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-gray-400 text-sm uppercase tracking-wider">Score</span>
              <motion.div 
                key={displayScore}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-yellow-400">
                {displayScore}
              </motion.div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-sm uppercase tracking-wider">Time</span>
              <div className="text-3xl font-bold text-blue-400">{gameTime}s</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm uppercase tracking-wider">Boost</span>
              <span className={`text-sm font-medium ${boostActive ? 'text-purple-400' : 'text-green-400'}`}>
                {boostActive ? 'Active' : 'Ready'}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${boostActive ? 'bg-purple-500' : 'bg-green-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${boostProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Controls</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-medium shadow-inner">W/S</kbd>
                <span className="text-gray-300">Forward/Back</span>
              </div>
              <div className="flex items-center space-x-3">
                <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-medium shadow-inner">A/D</kbd>
                <span className="text-gray-300">Left/Right</span>
              </div>
              <div className="flex items-center space-x-3">
                <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-medium shadow-inner">Shift</kbd>
                <span className="text-gray-300">Boost</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full mx-4"
            >
              <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Game Over!</h2>
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-gray-400">Final Score</p>
                  <p className="text-5xl font-bold text-yellow-400">{score}</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity pointer-events-auto"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}