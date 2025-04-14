import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'

const Scene = ({ children }) => {
  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        {/* Main Camera */}
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI * 0.5} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
        />

        {/* Environment */}
        <Environment preset="sunset" />
        <fog attach="fog" args={['#17171b', 30, 90]} />

        {/* Game Elements */}
        {children}
      </Suspense>
    </Canvas>
  )
}

export default Scene