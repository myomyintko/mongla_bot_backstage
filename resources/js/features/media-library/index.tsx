import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { MediaLibraryProvider } from "./components/media-library-provider";
import { MediaLibraryTable } from "./components/media-library-table";
import { Search } from "@/components/search";

export function MediaLibrary() {
  return (
    <MediaLibraryProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Media Library</h2>
            <p className='text-muted-foreground'>
            Manage your media files, images, and videos.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <MediaLibraryTable />
        </div>
      </Main>
    </MediaLibraryProvider>
  )
}
