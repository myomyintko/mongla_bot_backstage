import { createContext, useContext, useState, type ReactNode } from 'react'
import { type MediaLibrary } from '../data/schema'

interface MediaLibraryContextType {
  selectedMedia: MediaLibrary[]
  setSelectedMedia: (media: MediaLibrary[]) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  sortBy: string
  setSortBy: (sort: string) => void
  filterByType: string
  setFilterByType: (type: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
}

const MediaLibraryContext = createContext<MediaLibraryContextType | undefined>(undefined)

interface MediaLibraryProviderProps {
  children: ReactNode
}

export function MediaLibraryProvider({ children }: MediaLibraryProviderProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaLibrary[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('created_at:desc')
  const [filterByType, setFilterByType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  return (
    <MediaLibraryContext.Provider
      value={{
        selectedMedia,
        setSelectedMedia,
        viewMode,
        setViewMode,
        sortBy,
        setSortBy,
        filterByType,
        setFilterByType,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        perPage,
        setPerPage,
      }}
    >
      {children}
    </MediaLibraryContext.Provider>
  )
}

export function useMediaLibrary() {
  const context = useContext(MediaLibraryContext)
  if (context === undefined) {
    console.warn('useMediaLibrary must be used within a MediaLibraryProvider')
    return {
      mediaItems: [],
      isLoading: false,
      error: null,
      refetch: () => {},
    }
  }
  return context
}
