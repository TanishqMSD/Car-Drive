import { useState } from 'react'
import { CARS } from '../config/cars'
import LoadingScreen from './LoadingScreen'

const CarSelection = ({ onCarSelect }) => {
  const [selectedCar, setSelectedCar] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCarSelect = (carKey) => {
    setSelectedCar(carKey)
  }

  const handleStartGame = () => {
    if (!selectedCar) return
    setIsLoading(true)
    setTimeout(() => {
      onCarSelect(CARS[selectedCar])
    }, 3000)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            Select Your Racing Machine
          </h1>
          <p className="text-lg text-gray-400">Choose your dream car and start the race</p>
        </div>
        
        <div className="flex justify-center gap-6 mb-10">
          {Object.entries(CARS).map(([key, car]) => (
            <div
              key={key}
              className={`relative group cursor-pointer transition-all duration-500 transform w-[280px] ${
                selectedCar === key ? 'scale-105 -translate-y-2' : 'hover:scale-102 hover:-translate-y-1'
              }`}
              onClick={() => handleCarSelect(key)}
            >
              <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                selectedCar === key 
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-2 ring-blue-500' 
                  : 'bg-gray-800/50 group-hover:bg-gray-700/50'
              }`} />
              
              <div className="relative p-4">
                <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={car.preview}
                    alt={car.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{car.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{car.description}</p>
                  
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-gray-400">Scale: {car.scale}x</span>
                    <span className={`px-3 py-1 rounded-full font-medium transition-all duration-300 ${
                      selectedCar === key 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {selectedCar === key ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCar && (
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedCar}
            >
              Start Racing
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarSelection 