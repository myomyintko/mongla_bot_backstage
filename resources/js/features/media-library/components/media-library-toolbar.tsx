import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Search, SortAsc } from 'lucide-react'
import { useState } from 'react'
import { fileTypes, sortOptions, viewModes } from '../data/data'
import { useMediaLibrary } from './media-library-provider'
import { MediaLibraryUploadDialog } from './media-library-upload-dialog'

export function MediaLibraryToolbar() {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filterByType,
    setFilterByType,
    searchQuery,
    setSearchQuery,
  } = useMediaLibrary()

  const [showFilters, setShowFilters] = useState(false)


  return (
    <div className='space-y-4'>
      {/* Main Toolbar */}
      <div className='flex items-center justify-between space-y-2 flex-col sm:flex-row sm:space-y-0'>
        <div className='flex items-center space-x-2 flex-1'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search media files...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-8'
            />
          </div>
          
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='hidden sm:flex'
          >
            <Filter className='mr-2 h-4 w-4' />
            Filters
          </Button>
        </div>

        <div className='flex items-center space-x-2'>
          {/* View Mode Toggle */}
          <div className='flex items-center border rounded-md'>
            {viewModes.map((mode) => {
              const IconComponent = mode.icon
              return (
                <Button
                  key={mode.value}
                  variant={viewMode === mode.value ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode(mode.value as 'grid' | 'list')}
                  className='rounded-none first:rounded-l-md last:rounded-r-md'
                >
                  <IconComponent className='mr-1 h-4 w-4' />
                  <span className='hidden sm:inline'>{mode.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-[180px]'>
              <SortAsc className='mr-2 h-4 w-4' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Upload Button */}
          <MediaLibraryUploadDialog />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className='border-t pt-4'>
          <div className='flex items-center space-x-4 flex-wrap gap-y-2'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium'>File Type:</span>
              <Select value={filterByType} onValueChange={setFilterByType}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fileTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className='flex items-center space-x-2'>
                          <IconComponent className='h-4 w-4' />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {filterByType !== 'all' && (
              <Badge variant='secondary' className='cursor-pointer' onClick={() => setFilterByType('all')}>
                {(() => {
                  const type = fileTypes.find(t => t.value === filterByType)
                  if (!type) return null
                  const IconComponent = type.icon
                  return (
                    <>
                      <IconComponent className='mr-1 h-3 w-3' />
                      {type.label}
                    </>
                  )
                })()}
                <span className='ml-1'>×</span>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
