import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, Pause, Clock } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { statuses } from '../data/data'
import { type Advertisement } from '../data/schema'
import { advertisementsService } from '@/services/advertisements-service'

interface AdvertisementStatusControlProps {
  advertisement: Advertisement
}

export function AdvertisementStatusControl({ advertisement }: AdvertisementStatusControlProps) {
  const queryClient = useQueryClient()

  const pauseMutation = useMutation({
    mutationFn: () => advertisementsService.pauseAdvertisement(advertisement.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success('Advertisement paused successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to pause advertisement')
    },
  })

  const resumeMutation = useMutation({
    mutationFn: () => advertisementsService.resumeAdvertisement(advertisement.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success('Advertisement resumed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resume advertisement')
    },
  })

  const statusValue = String(advertisement.status)
  const status = statuses.find((s) => s.value === statusValue)

  // Check if advertisement is expired based on dates
  const now = new Date()
  const endDate = advertisement.end_date ? new Date(advertisement.end_date) : null
  const isExpired = endDate && now > endDate

  // Determine effective status
  const effectiveStatus = isExpired ? statuses.find(s => s.value === '2') : status

  if (!effectiveStatus) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unknown
      </Badge>
    )
  }

  const IconComponent = effectiveStatus.icon === 'Play' ? Play :
                       effectiveStatus.icon === 'Pause' ? Pause : Clock

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation()
    pauseMutation.mutate()
  }

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation()
    resumeMutation.mutate()
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`
                flex items-center space-x-1 px-2 py-1 text-xs font-medium border cursor-help
                ${effectiveStatus.color === 'green' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' :
                  effectiveStatus.color === 'gray' ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800' :
                  'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                }
              `}
            >
              <IconComponent className="w-3 h-3" />
              <span>{effectiveStatus.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{effectiveStatus.description}</p>
            {isExpired && (
              <p className="text-xs text-muted-foreground mt-1">
                Ended: {endDate?.toLocaleDateString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Quick Action Button */}
        {statusValue === '1' && !isExpired && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={handlePause}
                disabled={pauseMutation.isPending}
              >
                <Pause className="w-3 h-3 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pause advertisement</p>
            </TooltipContent>
          </Tooltip>
        )}

        {statusValue === '0' && !isExpired && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                onClick={handleResume}
                disabled={resumeMutation.isPending}
              >
                <Play className="w-3 h-3 text-green-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resume advertisement</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}