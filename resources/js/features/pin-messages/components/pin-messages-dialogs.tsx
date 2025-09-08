import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PinMessagesImportDialog } from './pin-messages-import-dialog'
import { PinMessagesMutateDrawer } from './pin-messages-mutate-drawer'
import { usePinMessages } from './pin-messages-provider'
import { pinMessagesService } from '../../../services/pin-messages-service'

export function PinMessagesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePinMessages()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pinMessagesService.deletePinMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pin-messages'] })
      toast.success('Pin Message deleted successfully!')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete pin message')
    },
  })

  return (
    <>
      <PinMessagesMutateDrawer
        key='pin-messages-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <PinMessagesImportDialog
        key='pin-messages-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <PinMessagesMutateDrawer
            key={`pin-messages-update-${currentRow.id}`}
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
            key='pin-messages-delete'
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
              title={`Delete this pin message: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a pin message with the ID{' '}
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
