import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface MediaLibraryPaginationProps {
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
}

export function MediaLibraryPagination({ pagination, onPageChange }: MediaLibraryPaginationProps) {
  if (!pagination || pagination.last_page <= 1) {
    return null
  }

  const { current_page, last_page, total } = pagination
  const startItem = (current_page - 1) * pagination.per_page + 1
  const endItem = Math.min(current_page * pagination.per_page, total)

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current_page - delta); i <= Math.min(last_page - 1, current_page + delta); i++) {
      range.push(i)
    }

    if (current_page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current_page + delta < last_page - 1) {
      rangeWithDots.push('...', last_page)
    } else if (last_page > 1) {
      rangeWithDots.push(last_page)
    }

    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total} results
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <div className="px-2 py-1">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  variant={current_page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
