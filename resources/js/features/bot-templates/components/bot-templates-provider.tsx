import { createContext, useContext, useState, ReactNode } from 'react'
import { BotTemplate } from '@/features/bot-templates/data/schema'

interface BotTemplatesContextType {
  selectedTemplates: number[]
  setSelectedTemplates: (ids: number[]) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isPreviewDialogOpen: boolean
  setIsPreviewDialogOpen: (open: boolean) => void
  editingTemplate: BotTemplate | null
  setEditingTemplate: (template: BotTemplate | null) => void
  previewTemplate: BotTemplate | null
  setPreviewTemplate: (template: BotTemplate | null) => void
}

const BotTemplatesContext = createContext<BotTemplatesContextType | undefined>(undefined)

export function BotTemplatesProvider({ children }: { children: ReactNode }) {
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BotTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<BotTemplate | null>(null)

  return (
    <BotTemplatesContext.Provider
      value={{
        selectedTemplates,
        setSelectedTemplates,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isPreviewDialogOpen,
        setIsPreviewDialogOpen,
        editingTemplate,
        setEditingTemplate,
        previewTemplate,
        setPreviewTemplate,
      }}
    >
      {children}
    </BotTemplatesContext.Provider>
  )
}

export function useBotTemplates() {
  const context = useContext(BotTemplatesContext)
  if (context === undefined) {
    throw new Error('useBotTemplates must be used within a BotTemplatesProvider')
  }
  return context
}
