import { MediaLibraryToolbar } from './media-library-toolbar'
import { MediaLibrarySummary } from './media-library-summary'
import { MediaLibraryGrid } from './media-library-grid'
import { MediaLibraryList } from './media-library-list'
import { useMediaLibrary } from './media-library-provider'

export function MediaLibraryTable() {
  const { viewMode } = useMediaLibrary()

  return (
    <div className='space-y-6'>
      <MediaLibrarySummary />
      <MediaLibraryToolbar />
      
      {viewMode === 'grid' ? (
        <MediaLibraryGrid />
      ) : (
        <MediaLibraryList />
      )}
    </div>
  )
}
