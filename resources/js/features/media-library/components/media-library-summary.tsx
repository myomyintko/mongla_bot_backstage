import { Card, CardContent } from '@/components/ui/card'
import { mediaLibraryService } from '@/services/media-library-service'
import { useQuery } from '@tanstack/react-query'
import { FileText, Folder, HardDrive, Image, Music, Video } from 'lucide-react'
import { useMemo } from 'react'
import { useMediaLibrary } from './media-library-provider'

export function MediaLibrarySummary() {
  const { filterByType } = useMediaLibrary()

  // Fetch all media items for summary (no pagination)
  const { data: allMediaResponse, isLoading } = useQuery({
    queryKey: ['media-library-summary'],
    queryFn: () => mediaLibraryService.getMediaLibrary({
      page: 1,
      per_page: 1000, // Large number to get all items
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
  })

  const allMedia = allMediaResponse?.data || []

  const summary = useMemo(() => {
    let filteredMedia = allMedia

    // Apply current filter
    if (filterByType !== 'all') {
      filteredMedia = filteredMedia.filter(item => item.file_type === filterByType)
    }

    const totalFiles = filteredMedia.length
    const images = filteredMedia.filter(item => item.file_type === 'image').length
    const videos = filteredMedia.filter(item => item.file_type === 'video').length
    const documents = filteredMedia.filter(item => item.file_type === 'document').length
    const audio = 0 // No audio files in current mock data
    const other = filteredMedia.filter(item => item.file_type === 'other').length

    const totalSize = filteredMedia.reduce((sum, item) => sum + item.file_size, 0)
    const averageSize = totalFiles > 0 ? totalSize / totalFiles : 0
    
    // Get most recent upload
    const mostRecent = filteredMedia.length > 0 
      ? filteredMedia.reduce((latest, item) => 
          new Date(item.created_at) > new Date(latest.created_at) ? item : latest
        )
      : null

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    return {
      totalFiles,
      images,
      videos,
      documents,
      audio,
      other,
      totalSize: formatFileSize(totalSize),
      averageSize: formatFileSize(averageSize),
      mostRecent: mostRecent ? formatDate(mostRecent.created_at) : 'N/A'
    }
  }, [allMedia, filterByType])

  const summaryCards = [
    {
      title: 'Total Files',
      value: summary.totalFiles,
      icon: Folder,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Images',
      value: summary.images,
      icon: Image,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Videos',
      value: summary.videos,
      icon: Video,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    {
      title: 'Audio',
      value: summary.audio,
      icon: Music,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Documents',
      value: summary.documents,
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Storage Used',
      value: summary.totalSize,
      icon: HardDrive,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    }
  ]

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className='relative overflow-hidden shadow-sm'>
            <CardContent className='p-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='h-3 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-5 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6'>
      {summaryCards.map((card) => {
        const IconComponent = card.icon
        return (
          <Card key={card.title} className='relative overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
            <CardContent className='p-3'>
              <div className='flex items-center space-x-3'>
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium text-gray-600 mb-1 truncate'>
                    {card.title}
                  </p>
                  <p className='text-lg font-bold text-gray-900 truncate'>
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
