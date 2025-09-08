import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type MenuButton } from '../data/schema'

type MenuButtonsDialogType = 'create' | 'update' | 'delete' | 'import'

type MenuButtonsContextType = {
  open: MenuButtonsDialogType | null
  setOpen: (str: MenuButtonsDialogType | null) => void
  currentRow: MenuButton | null
  setCurrentRow: React.Dispatch<React.SetStateAction<MenuButton | null>>
}

const MenuButtonsContext = React.createContext<MenuButtonsContextType | null>(null)

export function MenuButtonsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<MenuButtonsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MenuButton | null>(null)

  return (
    <MenuButtonsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MenuButtonsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMenuButtons = () => {
  const menuButtonsContext = React.useContext(MenuButtonsContext)

  if (!menuButtonsContext) {
    throw new Error('useMenuButtons has to be used within <MenuButtonsContext>')
  }

  return menuButtonsContext
}
