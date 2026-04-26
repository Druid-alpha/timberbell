'use client'

export type SavedBoardItem = {
  id: string
  name: string
  price?: number
}

export type SavedBoard = {
  createdAt: string
  projectType: string
  budget: string
  notes: string
  items: SavedBoardItem[]
}

export const ROOM_ADVISOR_BOARD_KEY = 'timberbell:room-advisor-board'

export function readSavedBoard() {
  if (typeof window === 'undefined') return null as SavedBoard | null
  const value = window.localStorage.getItem(ROOM_ADVISOR_BOARD_KEY)
  if (!value) return null

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? (parsed as SavedBoard) : null
  } catch {
    return null
  }
}

export function writeSavedBoard(board: SavedBoard) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ROOM_ADVISOR_BOARD_KEY, JSON.stringify(board))
}
