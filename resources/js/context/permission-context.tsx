import React, { createContext, useContext, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'

interface PermissionContextType {
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  canView: (resource: string) => boolean
  canCreate: (resource: string) => boolean
  canEdit: (resource: string) => boolean
  canDelete: (resource: string) => boolean
  userRoles: string[]
  userPermissions: string[]
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

interface PermissionProviderProps {
  children: React.ReactNode
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { auth } = useAuthStore()

  const userRoles = useMemo(() => auth.user?.roles || [], [auth.user?.roles])
  const userPermissions = useMemo(() => auth.user?.permissions || [], [auth.user?.permissions])

  const hasPermission = (permission: string): boolean => {
    if (!userPermissions.length) return false
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!userPermissions.length) return false
    return permissions.some(permission => userPermissions.includes(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!userPermissions.length) return false
    return permissions.every(permission => userPermissions.includes(permission))
  }

  const hasRole = (role: string): boolean => {
    if (!userRoles.length) return false
    return userRoles.includes(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!userRoles.length) return false
    return roles.some(role => userRoles.includes(role))
  }

  // Resource-based permission helpers
  const canView = (resource: string): boolean => {
    return hasPermission(`${resource}.view`)
  }

  const canCreate = (resource: string): boolean => {
    return hasPermission(`${resource}.create`)
  }

  const canEdit = (resource: string): boolean => {
    return hasPermission(`${resource}.edit`)
  }

  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}.delete`)
  }

  const value: PermissionContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canView,
    canCreate,
    canEdit,
    canDelete,
    userRoles,
    userPermissions,
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    console.warn('usePermissions must be used within a PermissionProvider')
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      hasRole: () => false,
      hasAnyRole: () => false,
      canView: () => false,
      canCreate: () => false,
      canEdit: () => false,
      canDelete: () => false,
      userRoles: [],
      userPermissions: [],
    }
  }
  return context
}

// Hook for checking specific permissions
export function usePermission(permission: string): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

// Hook for checking specific roles
export function useRole(role: string): boolean {
  const { hasRole } = usePermissions()
  return hasRole(role)
}

// Hook for resource-based permissions
export function useResourcePermissions(resource: string) {
  const { canView, canCreate, canEdit, canDelete } = usePermissions()
  
  return {
    canView: canView(resource),
    canCreate: canCreate(resource),
    canEdit: canEdit(resource),
    canDelete: canDelete(resource),
  }
}
