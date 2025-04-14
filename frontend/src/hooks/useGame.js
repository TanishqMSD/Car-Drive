import { create } from 'zustand'

const useGameStore = create((set) => ({
  score: 0,
  boostActive: false,
  setScore: (score) => set({ score }),
  setBoostActive: (boostActive) => set({ boostActive }),
}))

export function useGame() {
  const { score, boostActive, setScore, setBoostActive } = useGameStore()
  return { score, boostActive, setScore, setBoostActive }
} 