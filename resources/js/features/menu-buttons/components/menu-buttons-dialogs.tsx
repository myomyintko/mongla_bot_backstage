import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuButtonsService } from '@/lib/menu-buttons-service'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MenuButtonsImportDialog } from './menu-buttons-import-dialog'
import { MenuButtonsMutateDrawer } from './menu-buttons-mutate-drawer'
import { useMenuButtons } from './menu-buttons-provider'

export function MenuButtonsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMenuButtons()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuButtonsService.deleteMenuButton(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-buttons'] })
      toast.success('Menu button deleted successfully!')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete menu button')
    },
  })

  return (
    <>
      <MenuButtonsMutateDrawer
        key='menu-buttons-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <MenuButtonsImportDialog
        key='menu-buttons-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <MenuButtonsMutateDrawer
            key={`menu-buttons-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='menu-buttons-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              deleteMutation.mutate(currentRow.id)
            }}
            className='max-w-md'
              title={`Delete this menu button: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a menu button with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
