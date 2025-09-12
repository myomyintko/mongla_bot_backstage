import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { roleService, type Role } from '@/services/role-service'
import { useRoles } from './roles-provider'

interface RolesDeleteDialogProps {
  open: boolean
  onClose: () => void
  role?: Role
}

export function RolesDeleteDialog({ open, onClose, role }: RolesDeleteDialogProps) {
  const queryClient = useQueryClient()
  const { currentRow } = useRoles()
  
  const roleToDelete = role || currentRow

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Role deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      onClose()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete role'
      toast.error(message)
    },
  })

  const handleDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id)
    }
  }

  const isSystemRole = roleToDelete && ['Super Admin', 'Admin'].includes(roleToDelete.name)

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            {isSystemRole ? (
              <>
                System roles cannot be deleted. The role "{roleToDelete?.name}" is a protected system role.
              </>
            ) : (
              <>
                Are you sure you want to delete the role "{roleToDelete?.name}"? 
                This action cannot be undone and will remove all associated permissions.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          {!isSystemRole && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}