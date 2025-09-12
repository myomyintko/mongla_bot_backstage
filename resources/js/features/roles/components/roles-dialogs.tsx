import { useRoles } from './roles-provider'
import { RolesMutateDrawer } from './roles-mutate-drawer'
import { RolesDeleteDialog } from './roles-delete-dialog'

export function RolesDialogs() {
  const { open, setOpen, currentRow } = useRoles()

  return (
    <>
      {/* Create/Edit Role Sheet */}
      <RolesMutateDrawer
        open={open === 'create' || open === 'edit'}
        onOpenChange={(isOpen) => setOpen(isOpen ? open : null)}
        currentRow={open === 'edit' ? currentRow : undefined}
      />

      {/* Delete Role Dialog */}
      <RolesDeleteDialog
        open={open === 'delete'}
        onClose={() => setOpen(null)}
        role={currentRow}
      />
    </>
  )
}
