import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CanDelete } from '@/components/permission/permission-gate'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { type Role } from '../data/schema'
import { roleService } from '@/services/role-service'

interface DataTableBulkActionsProps {
  table: Table<Role>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const queryClient = useQueryClient()
  const selectedRows = table.getSelectedRowModel().rows
  const selectedRoles = selectedRows.map((row) => row.original)

  // Check if any selected roles are system roles that cannot be deleted
  const hasSystemRoles = selectedRoles.some(role => 
    ['Super Admin', 'Admin'].includes(role.name)
  )

  const bulkDeleteMutation = useMutation({
    mutationFn: async (roleIds: string[]) => {
      // Delete roles one by one since there's no bulk delete endpoint
      const deletePromises = roleIds.map(id => roleService.deleteRole(id))
      await Promise.all(deletePromises)
    },
    onSuccess: () => {
      toast.success(`${selectedRoles.length} role${selectedRoles.length === 1 ? '' : 's'} deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      table.resetRowSelection()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete roles'
      toast.error(message)
    },
  })

  const handleBulkDelete = () => {
    // Filter out system roles
    const deletableRoles = selectedRoles.filter(role => 
      !['Super Admin', 'Admin'].includes(role.name)
    )
    
    if (deletableRoles.length === 0) {
      toast.error('Cannot delete system roles')
      return
    }

    const roleIds = deletableRoles.map(role => role.id)
    bulkDeleteMutation.mutate(roleIds)
  }

  if (selectedRows.length === 0) {
    return null
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground'>
        {selectedRows.length} of {table.getRowCount()} row(s) selected
      </span>
      <CanDelete resource="roles">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='destructive'
              size='sm'
              disabled={hasSystemRoles || bulkDeleteMutation.isPending}
              className='h-8'
            >
              <Trash2 className='h-4 w-4 mr-1' />
              Delete ({selectedRows.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Roles</AlertDialogTitle>
              <AlertDialogDescription>
                {hasSystemRoles ? (
                  'Some selected roles are system roles and cannot be deleted. Only non-system roles will be removed.'
                ) : (
                  `Are you sure you want to delete ${selectedRows.length} role${selectedRows.length === 1 ? '' : 's'}? This action cannot be undone.`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                variant="destructive"
              >
                {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CanDelete>
    </div>
  )
}