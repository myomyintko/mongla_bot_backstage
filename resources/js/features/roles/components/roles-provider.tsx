import { createContext, useContext, useState } from 'react'

type RolesDialogType = 'create' | 'edit' | 'delete'

type RolesContextType = {
  open: RolesDialogType | null
  setOpen: (open: RolesDialogType | null) => void
  currentRow: any
  setCurrentRow: (row: any) => void
}

const RolesContext = createContext<RolesContextType | undefined>(undefined)

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<RolesDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<any>(null)

  return (
    <RolesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  const context = useContext(RolesContext)
  if (context === undefined) {
    console.warn('useRoles must be used within a RolesProvider')
    return {
      roles: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    }
  }
  return context
}
