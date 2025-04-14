import { usePlane } from '@react-three/cannon'
import { useLoader } from '@react-three/fiber'
import { RepeatWrapping, TextureLoader } from 'three'

const Ground = () => {
  // Physics body for the ground
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'static',
  }))

  // Create a simple checkered texture for the ground
  const texture = useLoader(TextureLoader, '/road.png')
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(10, 10)

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

export default Ground