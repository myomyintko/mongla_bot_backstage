import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'

interface RecentSale {
  name: string
  email: string
  amount: string
}

interface RecentSalesProps {
  data?: RecentSale[]
  loading?: boolean
}

export function RecentSales({ data = [], loading = false }: RecentSalesProps) {
  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin mr-2' />
        <span className='text-muted-foreground'>Loading recent sales...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No recent sales found
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {data.map((sale, index) => {
        const initials = sale.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={index} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>{sale.name}</p>
                <p className='text-muted-foreground text-sm'>
                  {sale.email}
                </p>
              </div>
              <div className='font-medium'>{sale.amount}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
