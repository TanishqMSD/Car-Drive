import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import { useBox, useSphere } from '@react-three/cannon'
import { Vector3, MathUtils } from 'three'
import Car from './Car'

window.CAR_SPEED = 1
const LANE_CHANGE_SPEED = 0.2
const BOOST_MULTIPLIER = 2
const BOOST_DURATION = 3000
const COIN_VALUE = 5
const COLLISION_PENALTY = -20
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
const COIN_COUNT = 100
const LANE_WIDTH = ROAD_WIDTH / 3
const LANE_POSITIONS = [-LANE_WIDTH, 0, LANE_WIDTH] // Left, Center, Right lanes
const GROUND_SEGMENT_LENGTH = 10000
const GROUND_SEGMENTS = 5

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

function Obstacle({ position, onCollide }) {
  const [ref] = useBox(() => ({
    type: "static",
    position,
    args: [2, 2, 2],
    isTrigger: true,
    onCollide: onCollide
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
  const [yOffset, setYOffset] = useState(0)
  
  useEffect(() => {
    const fadeOut = setInterval(() => {
      setOpacity(prev => Math.max(0, prev - 0.05))
      setYOffset(prev => prev + 0.1)
    }, 50)
    
    return () => clearInterval(fadeOut)
  }, [])

  return (
    <Text
      position={[position[0], position[1] + yOffset, position[2]]}
      color={value > 0 ? "#4CAF50" : "#ff4444"}
      fontSize={1}
      anchorX="center"
      anchorY="middle"
      opacity={opacity}
    >
      {value > 0 ? `+${value}` : value}
    </Text>
  )
}

function ScoreDisplay({ score, time }) {
  return (
    <group position={[0, 3, 0]}>
      <mesh position={[10, 3.6, 0]}>
        <planeGeometry args={[5, 2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      <Text
        position={[10, 3.95, 0.1]}
        color="white"
        fontSize={0.7}
        anchorX="center"
        anchorY="middle"
      >
        Score: {score}
      </Text>
      <Text
        position={[10, 3.2, 0.1]}
        color="white"
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        Time: {time}s
      </Text>
    </group>
  )
}

function GameOverPopup({ score, onRetry }) {
  return (
    <group position={[0, 0, -10]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.8} />
      </mesh>
      <Text
        position={[0, 3, 0.1]}
        color="#ff4444"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
      >
        Game Over!
      </Text>
      <Text
        position={[0, 0, 0.1]}
        color="white"
        fontSize={1.5}
        anchorX="center"
        anchorY="middle"
      >
        Final Score: {score}
      </Text>
      <Text
        position={[0, -3, 0.1]}
        color="#4CAF50"
        fontSize={1.2}
        anchorX="center"
        anchorY="middle"
      >
        Press R to Retry
      </Text>
    </group>
  )
}

function TimerDisplay({ time }) {
  return (
    <group position={[15, 8, -10]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        color="white"
        fontSize={1.5}
        anchorX="center"
        anchorY="middle"
      >
        Time: {time}s
      </Text>
    </group>
  )
}

export default function GameScene({ selectedCar }) {
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
  const [timerActive, setTimerActive] = useState(false)

  // Physics for car
  const [carBody, api] = useBox(() => ({
    mass: 1000,
    position: carPosition,
    rotation: [0, Math.PI, 0],
    args: [2, 1, 4],
    linearDamping: 0.95,
    angularDamping: 0.95,
    onCollide: (e) => {
      if (e.body.userData?.isObstacle && !collisionCooldown) {
        setCollisionCooldown(true)
        setScore(prev => prev + COLLISION_PENALTY)
        setScorePopups(prev => [...prev, {
          id: Date.now(),
          position: [...carPosition],
          value: COLLISION_PENALTY
        }])
        setSpeed(0)
        api.velocity.set(0, 0, 0)
        setTimeout(() => setCollisionCooldown(false), COLLISION_COOLDOWN)
      }
    }
  }))

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

  // Start timer when car loads
  useEffect(() => {
    if (selectedCar && !timerActive) {
      setTimerActive(true)
      const timer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            setGameOver(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [selectedCar, timerActive])

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
    setTimerActive(false)
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

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
  })

  useFrame((state, delta) => {
    if (!carRef.current || gameOver) return

    // Update car position based on controls
    let targetSpeed = keys.current.forward ? CAR_SPEED : keys.current.backward ? -CAR_SPEED : 0
    if (boostActive && keys.current.forward) targetSpeed *= BOOST_MULTIPLIER
    
    setSpeed(MathUtils.lerp(speed, targetSpeed, 0.1))

    // Handle lane changes with sequential transitions
    const targetX = LANE_POSITIONS[currentLane]
    const currentX = carPosition[0]
    const newX = MathUtils.lerp(currentX, targetX, LANE_CHANGE_SPEED)
    
    // Update car position
    const newPosition = [newX, carPosition[1], carPosition[2] - speed]
    setCarPosition(newPosition)
    api.position.set(...newPosition)

    // Update camera position
    const cameraIdealPosition = new Vector3(
      newPosition[0],
      CAMERA_HEIGHT,
      newPosition[2] + CAMERA_DISTANCE
    )
    
    cameraRef.current.position.lerp(cameraIdealPosition, CAMERA_LAG)
    cameraRef.current.target.lerp(new Vector3(newPosition[0], 0, newPosition[2]), CAMERA_LAG)
    
    state.camera.position.copy(cameraRef.current.position)
    state.camera.lookAt(cameraRef.current.target)

    // Check for coin collection
    sceneObjects.coins.forEach((coinPos, index) => {
      const distance = Math.sqrt(
        Math.pow(newPosition[0] - coinPos[0], 2) +
        Math.pow(newPosition[2] - coinPos[2], 2)
      )
      if (distance < 2) {
        setScore(prev => prev + COIN_VALUE)
        setScorePopups(prev => [...prev, {
          id: Date.now(),
          position: [coinPos[0], coinPos[1] + 2, coinPos[2]],
          value: COIN_VALUE
        }])
        sceneObjects.coins.splice(index, 1)
      }
    })

    // Update score popups
    setScorePopups(prev => prev.filter(popup => popup.opacity > 0))
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
        break
      case 's':
      case 'arrowdown':
        keys.current.backward = true
        break
      case 'a':
      case 'arrowleft':
        if (currentLane > 0) {
          setCurrentLane(prev => prev - 1)
        }
        break
      case 'd':
      case 'arrowright':
        if (currentLane < 2) {
          setCurrentLane(prev => prev + 1)
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
        break
      case 's':
      case 'arrowdown':
        keys.current.backward = false
        break
      case 'a':
      case 'arrowleft':
        keys.current.left = false
        break
      case 'd':
      case 'arrowright':
        keys.current.right = false
        break
      case 'shift':
        keys.current.boost = false
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

  // Handle retry key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver && e.key.toLowerCase() === 'r') {
        resetGame()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver])

  return (
    <>
      {/* Score and Timer Display */}
      <group position={[carPosition[0], carPosition[1], carPosition[2]]}>
        <ScoreDisplay score={score} time={gameTime} />
      </group>

      {/* Ground segments */}
      {Array.from({ length: GROUND_SEGMENTS }).map((_, i) => (
        <mesh 
          key={`ground-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, i * GROUND_SEGMENT_LENGTH - GROUND_SEGMENT_LENGTH * 2]} 
          receiveShadow
        >
          <planeGeometry args={[ROAD_WIDTH * 4, GROUND_SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#3b7339" roughness={1} />
        </mesh>
      ))}

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1, ROAD_LENGTH]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Car */}
      <group ref={carRef}>
        <Car
          selectedCar={selectedCar}
          position={carPosition}
        />
      </group>

      {/* Scene Objects */}
      {sceneObjects.trees.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} />
      ))}
      
      {sceneObjects.obstacles.map((pos, i) => (
        <Obstacle
          key={`obstacle-${i}`}
          position={pos}
          onCollide={() => {
            if (!collisionCooldown) {
              setCollisionCooldown(true)
              setScore(prev => prev + COLLISION_PENALTY)
              setScorePopups(prev => [...prev, {
                id: Date.now(),
                position: [...carPosition],
                value: COLLISION_PENALTY
              }])
              setSpeed(0)
              api.velocity.set(0, 0, 0)
              setTimeout(() => setCollisionCooldown(false), COLLISION_COOLDOWN)
            }
          }}
        />
      ))}
      
      {sceneObjects.coins.map((pos, i) => (
        <Coin
          key={`coin-${i}`}
          position={pos}
          onCollect={() => {
            setScore(prev => prev + COIN_VALUE)
            setScorePopups(prev => [...prev, { id: Date.now(), position: pos, value: COIN_VALUE }])
          }}
        />
      ))}

      {/* Score Popups */}
      {scorePopups.map(popup => (
        <ScorePopup
          key={popup.id}
          position={popup.position}
          value={popup.value}
        />
      ))}

      {/* Game Over Popup */}
      {gameOver && (
        <GameOverPopup
          score={score}
          onRetry={resetGame}
        />
      )}
    </>
  )
}
