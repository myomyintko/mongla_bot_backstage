import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Advertisement } from '../data/schema'

type AdvertisementsDialogType = 'create' | 'update' | 'delete' | 'import'

type AdvertisementsContextType = {
    open: AdvertisementsDialogType | null
  setOpen: (str: AdvertisementsDialogType | null) => void
  currentRow: Advertisement | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Advertisement | null>>
}

const AdvertisementsContext = React.createContext<AdvertisementsContextType | null>(null)

export function AdvertisementsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AdvertisementsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Advertisement | null>(null)

  return (
    <AdvertisementsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdvertisementsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdvertisements = () => {
    const advertisementsContext = React.useContext(AdvertisementsContext)

  if (!advertisementsContext) {
    throw new Error('useAdvertisements has to be used within <AdvertisementsContext>')
  }

  return advertisementsContext
}
