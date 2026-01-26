import type { Link } from '@/types/setting.type'
import { createContext } from 'react'

export interface MovableContextType {
  movingLink: Link | null
  movingLinkFromBlockIndex: number | undefined
  setMovingLink: (link: Link | null) => void
  setMovingLinkFromBlockIndex: (index: number | undefined) => void
}

export const MovableContext = createContext<MovableContextType>({
  movingLink: null,
  movingLinkFromBlockIndex: undefined,
  setMovingLink: () => {},
  setMovingLinkFromBlockIndex: () => {},
})
