import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import { AppTitle } from './app-title'
import { getFilteredSidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()
  
  // Get filtered sidebar data based on user permissions
  const filteredSidebarData = getFilteredSidebarData(auth.user?.permissions || [])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {filteredSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
