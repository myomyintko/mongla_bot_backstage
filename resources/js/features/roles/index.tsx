import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CanView } from '@/components/permission/permission-gate'
import { roleService } from '@/services/role-service'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesProvider } from './components/roles-provider'
import { RolesPrimaryButtons } from './components/roles-primary-buttons'
import { RolesTable } from './components/roles-table'
import { ForbiddenError } from '../errors/forbidden'

const route = getRouteApi('/_authenticated/roles/')

export function Roles() {
  const search = route.useSearch()
  const { data: rolesData, isLoading, error } = useQuery({
    queryKey: ['roles', search],
    queryFn: () => roleService.getRoles({
      page: search.page || 1,
      per_page: search.per_page || 10,
      search: search.filter,
    }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading roles</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
      <CanView resource="roles" fallback={ <ForbiddenError/> }>
      <RolesProvider>
      <Header fixed>  
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Role Management</h2>
            <p className='text-muted-foreground'>
              Manage user roles and their permissions.
            </p>
          </div>
          <RolesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <RolesTable 
            data={rolesData?.data || []} 
            paginationMeta={rolesData ? {
              current_page: rolesData.current_page,
              last_page: rolesData.last_page,
              per_page: rolesData.per_page,
              total: rolesData.total,
            } : undefined}
          />
        </div>
      </Main>

      <RolesDialogs />
      </RolesProvider>
    </CanView>
  )
}
