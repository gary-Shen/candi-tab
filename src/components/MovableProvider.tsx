import type { Link } from '@/types/setting.type'
import type { PropsWithChildren } from 'react'
import { useMemo, useState } from 'react'
import { MovableContext } from '@/context/movable.context'

export default function MovableProvider({ children }: PropsWithChildren) {
  const [movingLink, setMovingLink] = useState<Link | null>(null)
  const [movingLinkFromBlockIndex, setMovingLinkFromBlockIndex] = useState<number | undefined>()

  const value = useMemo(() => ({
    movingLink,
    movingLinkFromBlockIndex,
    setMovingLink,
    setMovingLinkFromBlockIndex,
  }), [movingLink, movingLinkFromBlockIndex])

  return (
    <MovableContext.Provider value={value}>
      {children}
    </MovableContext.Provider>
  )
}
