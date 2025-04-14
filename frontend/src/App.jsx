import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import { Suspense, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import GameScene from './components/GameScene'
import UI from './components/UI'
import CarSelection from './components/CarSelection'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [selectedCar, setSelectedCar] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const handleCarSelect = async (car) => {
    setIsLoading(true)
    
    try {
      // Create a promise that resolves after model is loaded
      await new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        loader.load(
          car.model,
          (gltf) => {
            // Add minimum loading time for better UX
            setTimeout(() => {
              resolve(gltf)
            }, 1000)
          },
          undefined,
          reject
        )
      })

      setSelectedCar(car)
      setGameStarted(true)
    } catch (error) {
      console.error('Error loading car model:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show car selection screen
  if (!selectedCar && !isLoading) {
    return <CarSelection onCarSelect={handleCarSelect} />
  }

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />
  }

  // Show game
  return (
    <div className="w-screen h-screen bg-[#87ceeb]">
      <UI />
      <Canvas 
        shadows 
        camera={{ 
          position: [0, 5, 15],
          fov: 60,
          near: 0.1,
          far: 1000 
        }}
      >
        <Suspense fallback={null}>
          {/* Scene Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <hemisphereLight
            skyColor="#87ceeb"
            groundColor="#444444"
            intensity={0.5}
          />

          {/* Scene Environment */}
          <fog attach="fog" args={['#87ceeb', 30, 250]} />
          <Environment preset="sunset" />
          
          {/* Game Physics and Scene */}
          <Physics 
            gravity={[0, -9.81, 0]}
            defaultContactMaterial={{
              friction: 0.7,
              restitution: 0.3,
            }}
          >
            {selectedCar && <GameScene selectedCar={selectedCar} />}
          </Physics>

          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#3b7339" />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
