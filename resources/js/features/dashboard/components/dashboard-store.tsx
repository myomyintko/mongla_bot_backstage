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
import { Store, Plus, TrendingUp, DollarSign, ShoppingBag, MapPin } from 'lucide-react'
import { topNav } from '../data/data'

export function DashboardStore() {
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
          <h1 className='text-2xl font-bold tracking-tight'>Store Management</h1>
          <div className='flex items-center space-x-2'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Store
            </Button>
          </div>
        </div>
        
        <div className='space-y-4'>
          {/* Store Stats */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Stores
                </CardTitle>
                <Store className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>24</div>
                <p className='text-muted-foreground text-xs'>
                  +3 new stores this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Stores
                </CardTitle>
                <ShoppingBag className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>22</div>
                <p className='text-muted-foreground text-xs'>
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Store Revenue
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$89.2K</div>
                <p className='text-muted-foreground text-xs'>
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg. Store Sales
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$3,720</div>
                <p className='text-muted-foreground text-xs'>
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Store Locations */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Stores</CardTitle>
                <CardDescription>
                  Stores with highest revenue this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {[
                    { name: 'Downtown Mall', location: 'New York, NY', revenue: '$12,450', growth: '+18.5%' },
                    { name: 'Westfield Center', location: 'Los Angeles, CA', revenue: '$11,890', growth: '+15.2%' },
                    { name: 'Metro Plaza', location: 'Chicago, IL', revenue: '$10,650', growth: '+12.8%' },
                    { name: 'City Center', location: 'Houston, TX', revenue: '$9,420', growth: '+9.1%' },
                    { name: 'Shopping District', location: 'Phoenix, AZ', revenue: '$8,750', growth: '+7.3%' },
                  ].map((store, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>{store.name}</p>
                        <p className='text-sm text-muted-foreground flex items-center'>
                          <MapPin className='mr-1 h-3 w-3' />
                          {store.location}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{store.revenue}</p>
                        <Badge variant='secondary'>{store.growth}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Status</CardTitle>
                <CardDescription>
                  Current status of all stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {[
                    { name: 'Active Stores', count: 22, status: 'Active', color: 'bg-green-500' },
                    { name: 'Maintenance', count: 1, status: 'Maintenance', color: 'bg-yellow-500' },
                    { name: 'Closed', count: 1, status: 'Closed', color: 'bg-red-500' },
                    { name: 'Opening Soon', count: 2, status: 'Opening', color: 'bg-blue-500' },
                  ].map((status, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                        <div>
                          <p className='font-medium'>{status.name}</p>
                          <p className='text-sm text-muted-foreground'>{status.status}</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{status.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Store Activity</CardTitle>
                <CardDescription>
                  Latest store updates and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {[
                    { name: 'Downtown Mall', action: 'New product line added', time: '2 hours ago' },
                    { name: 'Westfield Center', action: 'Store hours updated', time: '4 hours ago' },
                    { name: 'Metro Plaza', action: 'Inventory restocked', time: '6 hours ago' },
                    { name: 'City Center', action: 'Staff training completed', time: '1 day ago' },
                    { name: 'Shopping District', action: 'New promotion launched', time: '2 days ago' },
                  ].map((activity, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>{activity.name}</p>
                        <p className='text-sm text-muted-foreground'>{activity.action}</p>
                      </div>
                      <span className='text-sm text-muted-foreground'>{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store List */}
          <Card>
            <CardHeader>
              <CardTitle>All Stores</CardTitle>
              <CardDescription>
                Complete list of all stores with their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  { name: 'Downtown Mall', location: 'New York, NY', status: 'Active', revenue: '$12,450', employees: 15 },
                  { name: 'Westfield Center', location: 'Los Angeles, CA', status: 'Active', revenue: '$11,890', employees: 12 },
                  { name: 'Metro Plaza', location: 'Chicago, IL', status: 'Active', revenue: '$10,650', employees: 18 },
                  { name: 'City Center', location: 'Houston, TX', status: 'Active', revenue: '$9,420', employees: 14 },
                  { name: 'Shopping District', location: 'Phoenix, AZ', status: 'Maintenance', revenue: '$8,750', employees: 10 },
                  { name: 'Central Plaza', location: 'Philadelphia, PA', status: 'Active', revenue: '$7,890', employees: 16 },
                ].map((store, index) => (
                  <div key={index} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                        <Store className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>{store.name}</p>
                        <p className='text-sm text-muted-foreground flex items-center'>
                          <MapPin className='mr-1 h-3 w-3' />
                          {store.location}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='font-medium'>{store.revenue}</p>
                        <p className='text-sm text-muted-foreground'>{store.employees} employees</p>
                      </div>
                      <Badge variant={
                        store.status === 'Active' ? 'default' :
                        store.status === 'Maintenance' ? 'secondary' : 'destructive'
                      }>
                        {store.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}