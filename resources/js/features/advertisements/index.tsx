import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdvertisementsDialogs } from './components/advertisements-dialogs'
import { AdvertisementsProvider } from './components/advertisements-provider'
import { AdvertisementsPrimaryButtons } from './components/advertisements-primary-buttons'
import { AdvertisementsTable } from './components/advertisements-table'
import { advertisementsService } from '@/services/advertisements-service'

const route = getRouteApi('/_authenticated/advertisements/')

export function Advertisements() {
  const search = route.useSearch()
  const { data: advertisementsData, isLoading, error } = useQuery({
    queryKey: ['advertisements', search],
    queryFn: () => advertisementsService.getAdvertisements({
      page: search.page || 1,
      per_page: search.per_page || 10,
      search: search.filter,
      status: search.status ? Number(search.status[0]) : undefined,
      store_id: search.store_id ? (search.store_id[0] === 'none' ? 'null' : Number(search.store_id[0])) : undefined,
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
          <h2 className="text-2xl font-bold text-red-600">Error loading advertisements</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <AdvertisementsProvider>
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
          <h2 className='text-2xl font-bold tracking-tight'>Advertisements</h2>
          <p className='text-muted-foreground'>
            Manage your advertisements and campaigns.
          </p>
          </div>
            <AdvertisementsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <AdvertisementsTable 
            data={advertisementsData?.data || []} 
              paginationMeta={advertisementsData ? {
              current_page: advertisementsData.current_page,
              last_page: advertisementsData.last_page,
              per_page: advertisementsData.per_page,
              total: advertisementsData.total,
            } : undefined}
          />  
        </div>
      </Main>

      <AdvertisementsDialogs />
    </AdvertisementsProvider>
  )
}
