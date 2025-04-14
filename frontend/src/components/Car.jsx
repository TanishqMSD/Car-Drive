import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

const Car = ({ controls }) => {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const { nodes, materials } = useGLTF('/models/car.glb')
  const carRef = useRef()

  useEffect(() => {
    // Apply proper material properties and environment mapping
    Object.values(materials).forEach(mat => {
      // Ensure material properties are set correctly
      mat.metalness = 0.9
      mat.roughness = 0.1
      mat.envMapIntensity = 1.5
      
      // Handle textures if present
      if (mat.map) {
        mat.map.encoding = THREE.sRGBEncoding
        mat.map.needsUpdate = true
      }
      
      // Enable proper material rendering
      mat.transparent = false
      mat.side = THREE.FrontSide
      mat.needsUpdate = true
    })

    const checkModelLoading = () => {
      try {
        if (!nodes || !materials) {
          throw new Error('Model resources not available')
        }

        const requiredMeshes = [
          'Mesh_body',
          'Mesh_body001',
          'Mesh_wheel_frontLeft',
          'Mesh_wheel_frontRight',
          'Mesh_wheel_rearLeft',
          'Mesh_wheel_rearRight'
        ]

        const missingMeshes = requiredMeshes.filter(
          mesh => !nodes[mesh]?.geometry
        )

        if (missingMeshes.length > 0) {
          throw new Error(`Missing required meshes: ${missingMeshes.join(', ')}`)
        }

        setModelLoaded(true)
        setLoadError(null)
      } catch (error) {
        console.error('Car model loading error:', error)
        setLoadError(error.message)
        setModelLoaded(false)
      }
    }

    checkModelLoading()

    return () => {
      setModelLoaded(false)
      setLoadError(null)
    }
  }, [nodes, materials])

  const [ref, api] = useBox(() => ({
    mass: 500,
    position: [0, 1, 0],
    rotation: [0, Math.PI, 0],
    args: [2, 1, 4],
  }))

  const speed = useRef(0)
  const maxSpeed = controls.boost ? 30 : 20
  const acceleration = controls.boost ? 0.8 : 0.5
  const deceleration = 0.3
  const turnSpeed = controls.boost ? 0.04 : 0.03

  useFrame((state, delta) => {
    if (!carRef.current || !modelLoaded) return

    if (controls.forward) {
      speed.current = Math.min(speed.current + acceleration, maxSpeed)
    } else if (controls.backward) {
      speed.current = Math.max(speed.current - acceleration, -maxSpeed / 2)
    } else {
      speed.current *= (1 - deceleration)
    }

    if (speed.current !== 0) {
      if (controls.left) {
        api.rotation.set(0, carRef.current.rotation.y + turnSpeed, 0)
      }
      if (controls.right) {
        api.rotation.set(0, carRef.current.rotation.y - turnSpeed, 0)
      }
    }

    const angle = carRef.current.rotation.y
    const velocity = [
      Math.sin(angle) * speed.current,
      0,
      Math.cos(angle) * speed.current
    ]
    api.velocity.set(...velocity)
  })

  if (!modelLoaded) {
    return (
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#666666" opacity={0.5} transparent />
        {loadError && (
          <group position={[0, 2, 0]}>
            <mesh>
              <planeGeometry args={[3, 0.5]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          </group>
        )}
      </mesh>
    )
  }

  return (
    <group ref={ref}>
      <group ref={carRef} scale={[0.02, 0.02, 0.02]} rotation={[0, Math.PI, 0]}>
        <mesh
          geometry={nodes.Mesh_body.geometry}
          material={materials["Material_6"]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={nodes.Mesh_body001.geometry}
          material={materials["Material_8"]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={nodes.Mesh_wheel_frontLeft.geometry}
          material={materials["Material_7"]}
          castShadow
          position={[-1, 0.3, 1.2]}
        />
        <mesh
          geometry={nodes.Mesh_wheel_frontRight.geometry}
          material={materials["Material_7"]}
          castShadow
          position={[1, 0.3, 1.2]}
        />
        <mesh
          geometry={nodes.Mesh_wheel_rearLeft.geometry}
          material={materials["Material_7"]}
          castShadow
          position={[-1, 0.3, -1.2]}
        />
        <mesh
          geometry={nodes.Mesh_wheel_rearRight.geometry}
          material={materials["Material_7"]}
          castShadow
          position={[1, 0.3, -1.2]}
        />
      </group>
    </group>
  )
}

export default Car

useGLTF.preload('/models/car.glb')
