import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { menuButtonsService } from '@/services/menu-buttons-service'
import { MenuButtonsDialogs } from './components/menu-buttons-dialogs'
import { MenuButtonsProvider } from './components/menu-buttons-provider'
import { MenuButtonsPrimaryButtons } from './components/menu-buttons-primary-buttons'
import { MenuButtonsTable } from './components/menu-buttons-table'

const route = getRouteApi('/_authenticated/menu-buttons/')

export function MenuButtons() {
  const search = route.useSearch()
  const { data: menuButtonsData, isLoading, error } = useQuery({
    queryKey: ['menu-buttons', search],
    queryFn: () => menuButtonsService.getMenuButtons({
      page: search.page || 1,
      per_page: search.per_page || 10,
      search: search.filter,
      status: search.status ? Number(search.status[0]) : undefined,
      button_type: search.button_type ? search.button_type[0] : undefined,
      parent_id: search.hierarchy && search.hierarchy.length > 0 
        ? (search.hierarchy[0] === 'root' ? 'null' : search.hierarchy[0] === 'child' ? 'not_null' : undefined)
        : undefined,
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
          <h2 className="text-2xl font-bold text-red-600">Error loading menu buttons</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <MenuButtonsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Menu Buttons</h2>
            <p className='text-muted-foreground'>
              Manage your menu button hierarchy and templates.
            </p>
          </div>
          <MenuButtonsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <MenuButtonsTable 
            data={menuButtonsData?.data || []} 
            paginationMeta={menuButtonsData ? {
              current_page: menuButtonsData.current_page,
              last_page: menuButtonsData.last_page,
              per_page: menuButtonsData.per_page,
              total: menuButtonsData.total,
            } : undefined}
          />
        </div>
      </Main>

      <MenuButtonsDialogs />
    </MenuButtonsProvider>
  )
}
