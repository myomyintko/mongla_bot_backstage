import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CanView } from '@/components/permission/permission-gate'
import { TelegraphConfigManagement } from './components/telegraph-config-management'
import { ForbiddenError } from '../../errors/forbidden'

export function TelegraphBots() {
  return (
    <CanView resource="telegraph" fallback={<ForbiddenError />}>
      <Header fixed>  
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold tracking-tight'>Telegram Bot</h1>
          <p className='text-muted-foreground mt-2'>
            Manage your configured Telegram bot and webhooks
          </p>
        </div>
        
        <div className="space-y-6">
          <TelegraphConfigManagement />
        </div>
      </Main>
    </CanView>
  )
}