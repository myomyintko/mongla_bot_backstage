import { Plus, Play, Pause, Activity, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CanCreate, CanEdit } from '@/components/permission/permission-gate'
import { useAdvertisements } from './advertisements-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { advertisementsService } from '@/services/advertisements-service'

export function AdvertisementsPrimaryButtons() {
  const { setOpen } = useAdvertisements()
  const queryClient = useQueryClient()

  const bulkPauseMutation = useMutation({
    mutationFn: () => advertisementsService.bulkPauseAll(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success(data.message || 'All advertisements paused successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to pause advertisements')
    },
  })

  const bulkResumeMutation = useMutation({
    mutationFn: () => advertisementsService.bulkResumeAll(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success(data.message || 'All advertisements resumed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resume advertisements')
    },
  })

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'pause':
        bulkPauseMutation.mutate()
        break
      case 'resume':
        bulkResumeMutation.mutate()
        break
      case 'jobs':
        // TODO: Implement view active delivery jobs
        console.log('View active delivery jobs')
        break
      case 'analytics':
        // TODO: Implement analytics dashboard
        console.log('View analytics dashboard')
        break
      default:
        console.log(`Bulk ${action} action`)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      {/* Quick Actions */}
      <TooltipProvider>
        <div className='flex items-center gap-1'>
          <CanEdit resource="advertisements">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('resume')}
                  disabled={bulkResumeMutation.isPending}
                  className="hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
                >
                  <Play size={16} className="text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resume all paused advertisements</p>
              </TooltipContent>
            </Tooltip>
          </CanEdit>

          <CanEdit resource="advertisements">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('pause')}
                  disabled={bulkPauseMutation.isPending}
                  className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950"
                >
                  <Pause size={16} className="text-orange-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pause all active advertisements</p>
              </TooltipContent>
            </Tooltip>
          </CanEdit>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('jobs')}
                className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
              >
                <Activity size={16} className="text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View active delivery jobs</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('analytics')}
                className="hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950"
              >
                <BarChart3 size={16} className="text-purple-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View analytics dashboard</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-8" />

      {/* Create Button */}
      <CanCreate resource="advertisements">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create</span> <Plus size={18} />
        </Button>
      </CanCreate>
    </div>
  )
}
