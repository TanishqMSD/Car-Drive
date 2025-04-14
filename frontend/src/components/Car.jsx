import { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const Car = ({ selectedCar, position }) => {
  const [modelLoaded, setModelLoaded] = useState(false)
  const { scene } = useGLTF(selectedCar.model)
  const soundRef = useRef(null)

  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.metalness = 0.9
          child.material.roughness = 0.1
          child.material.envMapIntensity = 1.5
          
          if (child.material.map) {
            child.material.map.encoding = THREE.sRGBEncoding
            child.material.map.needsUpdate = true
          }
          
          child.material.transparent = false
          child.material.side = THREE.FrontSide
          child.material.needsUpdate = true
        }
      }
    })

    // Initialize audio
    const audio = new Audio('/starter.wav')
    audio.volume = 0.5
    soundRef.current = audio

    setModelLoaded(true)
    soundRef.current.play()

    return () => {
      if (soundRef.current) {
        soundRef.current.pause()
        soundRef.current = null
      }
    }
  }, [scene])

  if (!modelLoaded) {
    return (
      <mesh position={position || [0, 1, 0]}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#666666" opacity={0.5} transparent />
      </mesh>
    )
  }

  return (
    <group 
      position={position || [0, 1, 0]}
    >
      <group 
        scale={[selectedCar.scale, selectedCar.scale, selectedCar.scale]}
        rotation={[0, Math.PI, 0]}
      >
        <primitive object={scene} />
      </group>
    </group>
  )
}

export default Car

// Preload all car models
useGLTF.preload('/models/car.glb')
useGLTF.preload('/models/jeep.glb')
useGLTF.preload('/models/wraith.glb')
