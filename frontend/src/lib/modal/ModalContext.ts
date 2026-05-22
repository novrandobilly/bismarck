import { createContext } from 'react'
import type { ReactNode } from 'react'

export interface ModalContextValue {
  open: (content: ReactNode) => void
  close: () => void
}

export const ModalContext = createContext<ModalContextValue | null>(null)
