import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CanView } from '@/components/permission/permission-gate'
import { botTemplatesService } from '@/services/bot-templates-service'
// No provider needed for simple activate/deactivate functionality
import { BotTemplatesTabs } from './components/bot-templates-tabs'
import { ForbiddenError } from '../errors/forbidden'
// No primary buttons needed - templates are managed by seeders
// No dialogs needed - templates are managed by seeders

const route = getRouteApi('/_authenticated/bot-templates/')

export function BotTemplates() {
  const search = route.useSearch()
  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ['bot-templates', search],
    queryFn: () => botTemplatesService.getBotTemplates({
      page: search.page || 1,
      per_page: search.per_page || 10,
      search: search.filter,
      type: search.type ? search.type[0] : undefined,
      is_active: search.is_active ? search.is_active[0] === 'true' : undefined,
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
          <h2 className="text-2xl font-bold text-red-600">
            Error loading bot templates
          </h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <CanView resource="bot-templates" fallback={<ForbiddenError/>}>
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
              <h2 className='text-2xl font-bold tracking-tight'>Bot Templates</h2>
              <p className='text-muted-foreground'>
                Manage your Telegram bot message templates and content.
              </p>
            </div>
            {/* No primary buttons - templates are managed by seeders */}
          </div>
           <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
             {templatesData?.data?.templates ? (
               <BotTemplatesTabs 
                 data={templatesData.data.templates} 
               />
             ) : (
               <div className="flex items-center justify-center py-8">
                 <div className="text-center">
                   <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                   <p className="text-gray-500">Create your first bot template to get started.</p>
                 </div>
               </div>
             )}
           </div>
        </Main>

    </CanView>
  )
}
