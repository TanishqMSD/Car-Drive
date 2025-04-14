import { useEffect, useState } from 'react'

const Score = ({ score, boostAvailable }) => {
  const [boostTimer, setBoostTimer] = useState(0)
  const [isBoostActive, setIsBoostActive] = useState(false)

  useEffect(() => {
    if (isBoostActive) {
      const timer = setInterval(() => {
        setBoostTimer(prev => {
          if (prev <= 0) {
            setIsBoostActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isBoostActive])

  const activateBoost = () => {
    if (boostAvailable && !isBoostActive) {
      setIsBoostActive(true)
      setBoostTimer(5) // 5 seconds boost duration
    }
  }

  return (
    <div className="fixed top-0 left-0 p-4 text-white font-bold">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2">
        <div className="text-2xl">Score: {score}</div>
        <div className={`text-lg ${boostAvailable ? 'text-green-400' : 'text-red-400'}`}>
          Boost: {boostAvailable ? 'Ready' : 'Charging'}
          {isBoostActive && ` (${boostTimer}s)`}
        </div>
      </div>
    </div>
  )
}

export default Score