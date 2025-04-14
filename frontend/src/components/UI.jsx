import { useEffect, useState } from 'react'
import { CARS } from '../config/cars'

function CarSelectionCard({ car, onSelect, selected }) {
  if (!car || !car.name || !car.description) {
    return null
  }

  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        selected ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={() => onSelect(car)}
    >
      {/* <div className="w-full h-48 bg-gray-200 rounded-lg mb-4">
        {car.preview && <img src={car.preview} alt={car.name} className="w-full h-full object-cover rounded-lg" />}
      </div>
      <div className="text-xl font-bold mb-2">{car.name}</div>
      <div className="text-sm">{car.description}</div> */}
    </div>
  )
}

function UI({ onCarSelect, selectedCar, gameStarted }) {
  if (!gameStarted) {
    return (
      <div className="absolute inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl max-w-4xl w-full">
          {/* <h2 className="text-3xl font-bold mb-6 text-center">Select Your Car</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(CARS).map((car) => (
              <CarSelectionCard
                key={car.name}
                car={car}
                onSelect={onCarSelect}
                selected={selectedCar?.name === car.name}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-0 left-0 p-4">
      {/* Your existing UI elements */}
    </div>
  )
}

export default UI