import { useRef, useState } from 'react'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

const Coin = ({ position, onCollect }) => {
  const [isCollected, setIsCollected] = useState(false)
  const coinRef = useRef()

  // Physics body for collision detection
  const [ref] = useBox(() => ({
    args: [1, 1, 0.2],
    position,
    isTrigger: true,
    onCollideBegin: () => {
      if (!isCollected) {
        setIsCollected(true)
        onCollect()
      }
    }
  }))

  if (isCollected) return null

  return (
    <group ref={ref}>
      <mesh
        ref={coinRef}
        position={position}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.5, 0.5, 0.5]}
      >
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.3}
          emissive="#ffa500"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

const CoinField = ({ count = 10, onCollect }) => {
  const positions = Array.from({ length: count }, (_, i) => [
    Math.random() * 40 - 20,
    1,
    Math.random() * 40 - 20
  ])

  return positions.map((position, index) => (
    <Coin
      key={index}
      position={position}
      onCollect={() => onCollect(index)}
    />
  ))
}

export default CoinField