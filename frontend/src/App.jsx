import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import { Suspense } from 'react'
import GameScene from './components/GameScene'
import UI from './components/UI'

function App() {
  return (
    <div className="w-screen h-screen">
      <UI />
      <Canvas shadows camera={{ position: [10, 5, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <GameScene />
          </Physics>
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
