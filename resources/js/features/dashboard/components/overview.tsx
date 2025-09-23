import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Loader2 } from 'lucide-react'

interface OverviewProps {
  data?: Array<{ name: string; total: number }>
  loading?: boolean
}

export function Overview({ data = [], loading = false }: OverviewProps) {
  if (loading) {
    return (
      <div className='flex items-center justify-center h-[350px]'>
        <Loader2 className='h-6 w-6 animate-spin mr-2' />
        <span className='text-muted-foreground'>Loading chart data...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-[350px] text-muted-foreground'>
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
