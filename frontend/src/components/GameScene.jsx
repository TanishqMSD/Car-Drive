import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Text } from '@react-three/drei'
import { useBox, useSphere } from '@react-three/cannon'
import { Vector3, MathUtils } from 'three'

const CAR_SPEED = 0.75
const LANE_CHANGE_SPEED = 0.2
const BOOST_MULTIPLIER = 2
const BOOST_DURATION = 3000
const COIN_VALUE = 10
const CAMERA_DISTANCE = 15
const CAMERA_HEIGHT = 8
const CAMERA_LAG = 0.1
const GAME_DURATION = 60
const COLLISION_COOLDOWN = 1000

// Scene constants
const ROAD_LENGTH = 10000
const ROAD_WIDTH = 20
const TREE_SPACING = 30
const OBSTACLE_COUNT = 50
const COIN_COUNT = 25
const LANE_WIDTH = ROAD_WIDTH / 3
const LANE_POSITIONS = [-LANE_WIDTH, 0, LANE_WIDTH] // Left, Center, Right lanes

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 4]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh castShadow position={[0, 5, 0]}>
        <coneGeometry args={[2, 6, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
    </group>
  )
}

function Coin({ position, onCollect }) {
  const [ref] = useSphere(() => ({
    type: "static",
    position,
    args: [0.5],
    isTrigger: true,
    onCollide: onCollect,
  }))

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#ffd700" metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

function Obstacle({ position }) {
  const [ref] = useBox(() => ({
    type: "static",
    position,
    args: [2, 2, 2],
  }))

  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff4444" />
    </mesh>
  )
}

function ScorePopup({ position, value }) {
  const [opacity, setOpacity] = useState(1)
  
  useEffect(() => {
    const fadeOut = setInterval(() => {
      setOpacity(prev => Math.max(0, prev - 0.05))
    }, 50)
    
    return () => clearInterval(fadeOut)
  }, [])

  return (
    <Text
      position={position}
      color="gold"
      fontSize={1}
      anchorX="center"
      anchorY="middle"
      opacity={opacity}
    >
      +{value}
    </Text>
  )
}

function GameOverScreen({ score, highScores, onRetry }) {
  return (
    <group position={[0, 5, 0]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      <Text
        position={[0, 3, 1]}
        color="#ff4444"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        Game Over!
      </Text>
      <Text
        position={[0, 0, 1]}
        color="white"
        fontSize={1.5}
        anchorX="center"
        anchorY="middle"
      >
        Final Score: {score}
      </Text>
      <Text
        position={[0, -2, 1]}
        color="#4CAF50"
        fontSize={1.2}
        anchorX="center"
        anchorY="middle"
        onClick={onRetry}
      >
        Press R to Retry
      </Text>
    </group>
  )
}

export default function GameScene() {
  const carRef = useRef()
  const cameraRef = useRef({
    position: new Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE),
    target: new Vector3()
  })
  const [speed, setSpeed] = useState(0)
  const [boostActive, setBoostActive] = useState(false)
  const [score, setScore] = useState(0)
  const [carPosition, setCarPosition] = useState([0, 0.5, 0])
  const [currentLane, setCurrentLane] = useState(1)
  const [gameTime, setGameTime] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [scorePopups, setScorePopups] = useState([])
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('carGameHighScores')
    return saved ? JSON.parse(saved) : []
  })
  const [collisionCooldown, setCollisionCooldown] = useState(false)

  // Load car model and setup environment
  const { scene: carScene } = useGLTF('/models/car.glb')
  
  useEffect(() => {
    carScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.envMapIntensity = 1.5
          child.material.needsUpdate = true
        }
      }
    })
  }, [carScene])

  // Game timer
  useEffect(() => {
    if (gameTime > 0 && !gameOver) {
      const timer = setInterval(() => {
        setGameTime(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (gameTime === 0 && !gameOver) {
      endGame()
    }
  }, [gameTime, gameOver])

  const endGame = () => {
    setGameOver(true)
    const newHighScores = [...highScores, score].sort((a, b) => b - a).slice(0, 5)
    setHighScores(newHighScores)
    localStorage.setItem('carGameHighScores', JSON.stringify(newHighScores))
  }

  const resetGame = () => {
    setScore(0)
    setGameTime(GAME_DURATION)
    setGameOver(false)
    setCarPosition([0, 0.5, 0])
    setCurrentLane(1)
    setSpeed(0)
    setScorePopups([])
  }

  // Generate positions for scene objects
  const sceneObjects = useMemo(() => {
    const objects = {
      trees: [],
      obstacles: [],
      coins: []
    }

    // Generate trees
    for (let i = -ROAD_LENGTH/2; i < ROAD_LENGTH/2; i += TREE_SPACING) {
      objects.trees.push([-ROAD_WIDTH/2 - 5, 0, i])
      objects.trees.push([ROAD_WIDTH/2 + 5, 0, i])
    }

    // Generate obstacles in lanes
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      const lane = Math.floor(Math.random() * 3)
      const x = LANE_POSITIONS[lane]
      const z = (Math.random() * ROAD_LENGTH) - ROAD_LENGTH/2
      objects.obstacles.push([x, 1, z])
    }

    // Generate coins in lanes
    for (let i = 0; i < COIN_COUNT; i++) {
      const lane = Math.floor(Math.random() * 3)
      const x = LANE_POSITIONS[lane]
      const z = (Math.random() * ROAD_LENGTH) - ROAD_LENGTH/2
      objects.coins.push([x, 1, z])
    }

    return objects
  }, [])

  // Physics for car
  const [carBody, api] = useBox(() => ({
    mass: 1000,
    position: carPosition,
    rotation: [0, Math.PI / 2, 0],
    args: [2, 1, 4],
    linearDamping: 0.95,
    angularDamping: 0.95,
    onCollide: (e) => {
      if (e.body.userData?.isObstacle && !collisionCooldown) {
        setCollisionCooldown(true)
        setSpeed(0)
        api.velocity.set(0, 0, 0)
        endGame()
        setTimeout(() => setCollisionCooldown(false), COLLISION_COOLDOWN)
      }
    }
  }))

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
  })

  useFrame((state, delta) => {
    if (!carRef.current || gameOver) return

    let currentSpeed = speed
    if (boostActive) {
      currentSpeed *= BOOST_MULTIPLIER
    }

    // Handle lane changes with sequential transitions
    const targetX = LANE_POSITIONS[currentLane]
    const currentX = carPosition[0]
    const newX = MathUtils.lerp(currentX, targetX, LANE_CHANGE_SPEED)
    
    // Update car position
    const newZ = carPosition[2] + currentSpeed
    setCarPosition([newX, carPosition[1], newZ])
    api.position.set(newX, carPosition[1], newZ)

    // Update camera
    const idealCameraPos = new Vector3(
      newX,
      CAMERA_HEIGHT,
      newZ - CAMERA_DISTANCE
    )
    cameraRef.current.position.lerp(idealCameraPos, CAMERA_LAG)
    state.camera.position.copy(cameraRef.current.position)
    state.camera.lookAt(newX, carPosition[1] + 2, newZ)

    // Check for coin collection
    sceneObjects.coins.forEach((coinPos, index) => {
      const distance = Math.sqrt(
        Math.pow(newX - coinPos[0], 2) +
        Math.pow(newZ - coinPos[2], 2)
      )
      if (distance < 2) {
        setScore(prev => prev + COIN_VALUE)
        setScorePopups(prev => [...prev, {
          position: [coinPos[0], coinPos[1] + 2, coinPos[2]],
          value: COIN_VALUE,
          id: Date.now()
        }])
        sceneObjects.coins.splice(index, 1)
      }
    })

    // Update score popups
    setScorePopups(prev => prev.filter(popup => {
      popup.position[1] += 0.1
      return popup.position[1] < 10
    }))
  })

  const handleKeyDown = (e) => {
    if (gameOver && e.key.toLowerCase() === 'r') {
      resetGame()
      return
    }

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keys.current.forward = true
        setSpeed(CAR_SPEED)
        break
      case 's':
      case 'arrowdown':
        keys.current.backward = true
        setSpeed(-CAR_SPEED)
        break
      case 'a':
      case 'arrowleft':
        if (currentLane > 0) { // Only allow left movement if not in leftmost lane
          keys.current.left = true
          setCurrentLane(prev => prev - 1) // Move one lane left
          setCarPosition(prev => [LANE_POSITIONS[currentLane - 1], prev[1], prev[2]])
        }
        break
      case 'd':
      case 'arrowright':
        if (currentLane < 2) { // Only allow right movement if not in rightmost lane
          keys.current.right = true
          setCurrentLane(prev => prev + 1) // Move one lane right
          setCarPosition(prev => [LANE_POSITIONS[currentLane + 1], prev[1], prev[2]])
        }
        break
      case 'shift':
        keys.current.boost = true
        setBoostActive(true)
        setTimeout(() => setBoostActive(false), BOOST_DURATION)
        break
    }
  }

  const handleKeyUp = (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keys.current.forward = false
        setSpeed(0)
        break
      case 's':
      case 'arrowdown':
        keys.current.backward = false
        setSpeed(0)
        break
      case 'a':
      case 'arrowleft':
        keys.current.left = false
        break
      case 'd':
      case 'arrowright':
        keys.current.right = false
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameOver])

  return (
    <>
      {/* Car */}
      <mesh ref={carRef} castShadow receiveShadow>
        <primitive 
          object={carScene} 
          scale={0.45}
          rotation={[0, 0, 0]}
          position={carPosition}
        />
      </mesh>

      {/* Score Popups */}
      {scorePopups.map(popup => (
        <ScorePopup key={popup.id} position={popup.position} value={popup.value} />
      ))}

      {/* Game Over Screen */}
      {gameOver && (
        <GameOverScreen 
          score={score} 
          highScores={highScores} 
          onRetry={resetGame}
        />
      )}

      {/* Road - Simple plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#555555" roughness={0.8} />
      </mesh>

      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1, ROAD_LENGTH]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Trees */}
      {sceneObjects.trees.map((position, index) => (
        <Tree key={`tree-${index}`} position={position} />
      ))}

      {/* Obstacles */}
      {sceneObjects.obstacles.map((position, index) => (
        <Obstacle key={`obstacle-${index}`} position={position} />
      ))}

      {/* Coins */}
      {sceneObjects.coins.map((position, index) => (
        <Coin 
          key={`coin-${index}`} 
          position={position}
          onCollect={() => setScore(prev => prev + COIN_VALUE)}
        />
      ))}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH * 4, ROAD_LENGTH]} />
        <meshStandardMaterial color="#3b7339" roughness={1} />
      </mesh>

      {/* Lighting */}
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

      {/* Fog for depth effect */}
      <fog attach="fog" args={["#87ceeb", 50, 500]} />
    </>
  )
}