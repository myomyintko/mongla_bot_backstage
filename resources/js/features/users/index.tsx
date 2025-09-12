import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CanView } from '@/components/permission/permission-gate'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { userService, type UserFilters } from '@/services/user-service'
import { ForbiddenError } from '../errors/forbidden'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Convert search params to API filters
  const filters: UserFilters = {
    page: search.page,
    per_page: search.pageSize,
    search: search.username || undefined,
    status: search.status?.length ? search.status : undefined,
    role: search.role?.length ? search.role : undefined,
  }

  // Fetch users from API
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (isLoading) {
    return (
      <CanView resource="users" fallback={<ForbiddenError/>}>
        <UsersProvider>
          <Header fixed>
            <Search />
            <div className='ms-auto flex items-center space-x-4'>
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>

          <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                <p className='text-muted-foreground'>
                  Manage your users and their roles here.
                </p>
              </div>
              <UsersPrimaryButtons />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              </div>
            </div>
          </Main>

          <UsersDialogs />
        </UsersProvider>
      </CanView>
    )
  }

  if (error) {
    return (
      <CanView resource="users" fallback={<ForbiddenError/>}>
        <UsersProvider>
          <Header fixed>
            <Search />
            <div className='ms-auto flex items-center space-x-4'>
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>

          <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                <p className='text-muted-foreground'>
                  Manage your users and their roles here.
                </p>
              </div>
              <UsersPrimaryButtons />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-600">Error Loading Users</h2>
                  <p className="text-gray-600">Failed to load users. Please try again.</p>
                </div>
              </div>
            </div>
          </Main>

          <UsersDialogs />
        </UsersProvider>
      </CanView>
    )
  }

  return (
    <CanView resource="users" fallback={<ForbiddenError/>}>
      <UsersProvider>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
              <p className='text-muted-foreground'>
                Manage your users and their roles here.
              </p>
            </div>
            <UsersPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            <UsersTable 
              data={usersData?.data || []} 
              search={search} 
              navigate={navigate}
              paginationMeta={usersData ? {
                current_page: usersData.current_page,
                last_page: usersData.last_page,
                per_page: usersData.per_page,
                total: usersData.total,
              } : undefined}
            />
          </div>
        </Main>

        <UsersDialogs />
      </UsersProvider>
    </CanView>
  )
}
