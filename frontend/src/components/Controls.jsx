import { useEffect, useState } from 'react'

const Controls = ({ onControlsChange }) => {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      switch (key) {
        case 'w':
        case 'arrowup':
          setControls(prev => ({ ...prev, forward: true }))
          break
        case 's':
        case 'arrowdown':
          setControls(prev => ({ ...prev, backward: true }))
          break
        case 'a':
        case 'arrowleft':
          setControls(prev => ({ ...prev, left: true }))
          break
        case 'd':
        case 'arrowright':
          setControls(prev => ({ ...prev, right: true }))
          break
        case ' ':
        case 'shift':
          setControls(prev => ({ ...prev, boost: true }))
          break
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      switch (key) {
        case 'w':
        case 'arrowup':
          setControls(prev => ({ ...prev, forward: false }))
          break
        case 's':
        case 'arrowdown':
          setControls(prev => ({ ...prev, backward: false }))
          break
        case 'a':
        case 'arrowleft':
          setControls(prev => ({ ...prev, left: false }))
          break
        case 'd':
        case 'arrowright':
          setControls(prev => ({ ...prev, right: false }))
          break
        case ' ':
        case 'shift':
          setControls(prev => ({ ...prev, boost: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    onControlsChange(controls)
  }, [controls, onControlsChange])

  return null
}

export default Controls