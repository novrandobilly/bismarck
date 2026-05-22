import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ModalContext } from './ModalContext'

export function ModalProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null)

  const open = useCallback((c: ReactNode) => setContent(c), [])
  const close = useCallback(() => setContent(null), [])

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {content &&
        document.body &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={close}
          >
            <div
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && close()}
              tabIndex={-1}
              autoFocus
            >
              {content}
            </div>
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  )
}
