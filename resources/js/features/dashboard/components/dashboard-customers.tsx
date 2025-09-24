import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Users, UserPlus, TrendingUp, DollarSign, Loader2 } from 'lucide-react'
import { topNav } from '../data/data'
import { useEffect, useState } from 'react'
import { CustomersService, type CustomerStats, type Customer } from '@/services/customers-service'
import { toast } from 'sonner'

export function DashboardCustomers() {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, recentData] = await Promise.all([
          CustomersService.getStats(),
          CustomersService.getRecent(5)
        ])
        setStats(statsData)
        setRecentCustomers(recentData.data)
      } catch (error) {
        console.error('Failed to fetch customer data:', error)
        toast.error('Failed to load customer data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatGrowthRate = (rate: number) => {
    const sign = rate > 0 ? '+' : ''
    return `${sign}${rate}%`
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Customer Management</h1>
          <div className='flex items-center space-x-2'>
            <Button disabled>
              <UserPlus className='mr-2 h-4 w-4' />
              Add Customer
            </Button>
          </div>
        </div>

        <div className='space-y-4'>
          {/* Customer Stats */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Customers
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{stats?.total_customers?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Telegram users in bot
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  New Today
                </CardTitle>
                <UserPlus className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>+{stats?.new_customers_today || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      New users today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Growth Rate
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{formatGrowthRate(stats?.growth_rate || 0)}</div>
                    <p className='text-muted-foreground text-xs'>
                      vs yesterday
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg. Order Value
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$0.00</div>
                <p className='text-muted-foreground text-xs'>
                  Coming soon
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Latest Telegram users who joined the bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin mr-2' />
                  <span className='text-muted-foreground'>Loading customers...</span>
                </div>
              ) : recentCustomers.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No customers found. Users will appear here when they start using the Telegram bot.
                </div>
              ) : (
                <div className='space-y-4'>
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                          <span className='text-sm font-medium text-primary'>
                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium'>{customer.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {customer.username ? `@${customer.username}` : `ID: ${customer.id}`}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <Badge variant='default'>
                          {customer.status}
                        </Badge>
                        <span className='text-sm text-muted-foreground'>{customer.join_date_formatted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
