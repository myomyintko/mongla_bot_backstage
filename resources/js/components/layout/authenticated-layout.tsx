import { Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.user || !auth.accessToken) {
      // Redirect to login page with current location as redirect parameter
      const currentPath = window.location.pathname + window.location.search
      navigate({ 
        to: '/sign-in', 
        search: { redirect: currentPath },
        replace: true 
      })
    }
  }, [auth.user, auth.accessToken, navigate])

  // Don't render the layout if user is not authenticated
  if (!auth.user || !auth.accessToken) {
    return null
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-[[data-layout=fixed]]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
