import React from 'react'
import { usePermissions } from '@/context/permission-context'

interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  role?: string
  roles?: string[]
  resource?: string
  action?: 'view' | 'create' | 'edit' | 'delete'
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  permissions,
  role,
  roles,
  resource,
  action,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canView,
    canCreate,
    canEdit,
    canDelete,
  } = usePermissions()

  let hasAccess = false

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission)
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  // Check single role
  if (role) {
    hasAccess = hasRole(role)
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    hasAccess = hasAnyRole(roles)
  }

  // Check resource-based permissions
  if (resource && action) {
    switch (action) {
      case 'view':
        hasAccess = canView(resource)
        break
      case 'create':
        hasAccess = canCreate(resource)
        break
      case 'edit':
        hasAccess = canEdit(resource)
        break
      case 'delete':
        hasAccess = canDelete(resource)
        break
      default:
        hasAccess = false
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common use cases
export function CanView({ resource, children, fallback = null }: { resource: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate resource={resource} action="view" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanCreate({ resource, children, fallback = null }: { resource: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate resource={resource} action="create" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanEdit({ resource, children, fallback = null }: { resource: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate resource={resource} action="edit" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanDelete({ resource, children, fallback = null }: { resource: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate resource={resource} action="delete" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function HasRole({ role, children, fallback = null }: { role: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={role} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function HasPermission({ permission, children, fallback = null }: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
