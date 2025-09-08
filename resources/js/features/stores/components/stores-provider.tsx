import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Store } from '../data/schema'

type StoresDialogType = 'create' | 'update' | 'delete' | 'import'

type StoresContextType = {
    open: StoresDialogType | null
  setOpen: (str: StoresDialogType | null) => void
  currentRow: Store | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Store | null>>
}

const StoresContext = React.createContext<StoresContextType | null>(null)

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StoresDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Store | null>(null)

  return (
    <StoresContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StoresContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStores = () => {
  const storesContext = React.useContext(StoresContext)

  if (!storesContext) {
    throw new Error('useStores has to be used within <StoresContext>')
  }

  return storesContext
}
