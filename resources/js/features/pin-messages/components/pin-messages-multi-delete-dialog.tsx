'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { pinMessagesService } from '@/services/pin-messages-service'
import { type PinMessage } from '../data/schema'

type PinMessagesMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function PinMessagesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: PinMessagesMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return pinMessagesService.bulkDelete(ids)
    },
    onSuccess: () => {
      toast.success(`Deleted ${selectedRows.length} ${
        selectedRows.length > 1 ? 'pin messages' : 'pin message'
      }`)
      queryClient.invalidateQueries({ queryKey: ['pin-messages'] })
      table.resetRowSelection()
      setValue('')
      onOpenChange(false)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete pin messages'
      toast.error(message)
    },
  })

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    const selectedPinMessages = selectedRows.map((row) => row.original as PinMessage)
    const ids = selectedPinMessages.map(item => item.id)
    bulkDeleteMutation.mutate(ids)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || bulkDeleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'pin messages' : 'pin message'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the selected pin messages? <br />
            This action cannot be undone.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
