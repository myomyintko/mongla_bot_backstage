import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CanView } from '@/components/permission/permission-gate'
import { useBotTemplates } from './bot-templates-provider'

export function BotTemplatesPrimaryButtons() {
  const { setIsCreateDialogOpen } = useBotTemplates()

  return (
    <div className="flex items-center space-x-2">
      <CanView resource="bot-templates" action="create">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </CanView>
    </div>
  )
}
