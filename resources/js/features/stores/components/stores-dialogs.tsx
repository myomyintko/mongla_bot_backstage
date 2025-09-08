import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StoresImportDialog } from './stores-import-dialog'
import { StoresMutateDrawer } from './stores-mutate-drawer'
import { useStores } from './stores-provider'
import { storesService } from '@/lib/stores-service'

export function StoresDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStores()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => storesService.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store deleted successfully!')
      setOpen(null)
      setCurrentRow(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete store')
    },
  })

  return (
    <>
      <StoresMutateDrawer
        key='stores-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <StoresImportDialog
        key='stores-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <StoresMutateDrawer
            key={`stores-update-${currentRow.id}`}
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
            key='stores-delete'
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
              title={`Delete this store: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a store with the ID{' '}
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
