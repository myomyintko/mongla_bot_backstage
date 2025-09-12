export const roleStatuses = [
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'inactive',
    label: 'Inactive',
  },
]

export const systemRoles = ['Super Admin', 'Admin']

export const defaultRolePermissions = {
  'Super Admin': [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'stores.view', 'stores.create', 'stores.edit', 'stores.delete',
    'advertisements.view', 'advertisements.create', 'advertisements.edit', 'advertisements.delete',
    'pin-messages.view', 'pin-messages.create', 'pin-messages.edit', 'pin-messages.delete',
    'menu-buttons.view', 'menu-buttons.create', 'menu-buttons.edit', 'menu-buttons.delete',
    'media.view', 'media.upload', 'media.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'permissions.view', 'permissions.assign',
    'system.settings', 'system.logs', 'system.backup',
  ],
  'Admin': [
    'users.view', 'users.create', 'users.edit',
    'stores.view', 'stores.create', 'stores.edit', 'stores.delete',
    'advertisements.view', 'advertisements.create', 'advertisements.edit', 'advertisements.delete',
    'pin-messages.view', 'pin-messages.create', 'pin-messages.edit', 'pin-messages.delete',
    'menu-buttons.view', 'menu-buttons.create', 'menu-buttons.edit', 'menu-buttons.delete',
    'media.view', 'media.upload', 'media.delete',
    'roles.view', 'permissions.view',
  ],
  'Manager': [
    'stores.view', 'stores.create', 'stores.edit',
    'advertisements.view', 'advertisements.create', 'advertisements.edit',
    'pin-messages.view', 'pin-messages.create', 'pin-messages.edit',
    'menu-buttons.view', 'menu-buttons.create', 'menu-buttons.edit',
    'media.view', 'media.upload',
  ],
  'Editor': [
    'stores.view',
    'advertisements.view', 'advertisements.create', 'advertisements.edit',
    'pin-messages.view', 'pin-messages.create', 'pin-messages.edit',
    'menu-buttons.view', 'menu-buttons.create', 'menu-buttons.edit',
    'media.view', 'media.upload',
  ],
  'Viewer': [
    'stores.view',
    'advertisements.view',
    'pin-messages.view',
    'menu-buttons.view',
    'media.view',
  ],
}