import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type PinMessage } from '../data/schema'

type PinMessagesDialogType = 'create' | 'update' | 'delete' | 'import'

type PinMessagesContextType = {
    open: PinMessagesDialogType | null
  setOpen: (str: PinMessagesDialogType | null) => void
  currentRow: PinMessage | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PinMessage | null>>
}

const PinMessagesContext = React.createContext<PinMessagesContextType | null>(null)

export function PinMessagesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PinMessagesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PinMessage | null>(null)

  return (
    <PinMessagesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PinMessagesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePinMessages = () => {
      const pinMessagesContext = React.useContext(PinMessagesContext)

  if (!pinMessagesContext) {
    throw new Error('usePinMessages has to be used within <PinMessagesContext>')
  }

  return pinMessagesContext
}
