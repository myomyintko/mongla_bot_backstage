import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CanView } from '@/components/permission/permission-gate'
import { PinMessagesDialogs } from './components/pin-messages-dialogs'
import { PinMessagesProvider } from './components/pin-messages-provider'
import { PinMessagesPrimaryButtons } from './components/pin-messages-primary-buttons'
import { PinMessagesTable } from './components/pin-messages-table'
  import { pinMessagesService } from '../../services/pin-messages-service'
import { ForbiddenError } from '../errors/forbidden'

const route = getRouteApi('/_authenticated/pin-messages/')

export function PinMessages() {
  const search = route.useSearch()
  const { data: pinMessagesData, isLoading, error } = useQuery({
    queryKey: ['pin-messages', search],
    queryFn: () => pinMessagesService.getPinMessages({
      page: search.page || 1,
      per_page: search.per_page || 10,
      search: search.filter,
      status: search.status ? Number(search.status[0]) : undefined,
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
          <h2 className="text-2xl font-bold text-red-600">Error loading pin messages</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <CanView resource="pin-messages" fallback={<ForbiddenError/>}>
      <PinMessagesProvider>
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
          <h2 className='text-2xl font-bold tracking-tight'>Pin Messages</h2>
          <p className='text-muted-foreground'>
            Manage your pin messages and campaigns.
          </p>
          </div>
            <PinMessagesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <PinMessagesTable 
            data={pinMessagesData?.data || []} 
              paginationMeta={pinMessagesData ? {
              current_page: pinMessagesData.current_page,
              last_page: pinMessagesData.last_page,
              per_page: pinMessagesData.per_page,
              total: pinMessagesData.total,
            } : undefined}
          />  
        </div>
      </Main>

      <PinMessagesDialogs />
      </PinMessagesProvider>
    </CanView>
  )
}
