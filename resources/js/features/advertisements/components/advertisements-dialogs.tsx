import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdvertisementsImportDialog } from './advertisements-import-dialog'
import { AdvertisementsMutateDrawer } from './advertisements-mutate-drawer'
import { useAdvertisements } from './advertisements-provider'
import { advertisementsService } from '@/services/advertisements-service'

export function AdvertisementsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdvertisements()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => advertisementsService.deleteAdvertisement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success('Advertisement deleted successfully!')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete advertisement')
    },
  })

  return (
    <>
      <AdvertisementsMutateDrawer
        key='advertisements-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <AdvertisementsImportDialog
        key='advertisements-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <AdvertisementsMutateDrawer
            key={`advertisements-update-${currentRow.id}`}
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
            key='advertisements-delete'
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
              title={`Delete this advertisement: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a advertisement with the ID{' '}
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
