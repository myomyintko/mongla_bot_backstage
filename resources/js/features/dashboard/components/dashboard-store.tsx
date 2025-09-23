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
import { Store, Plus, TrendingUp, DollarSign, ShoppingBag, MapPin, Loader2 } from 'lucide-react'
import { topNav } from '../data/data'
import { useEffect, useState } from 'react'
import { storesService } from '@/services/stores-service'
import { toast } from 'sonner'

export function DashboardStore() {
  const [stats, setStats] = useState<any>(null)
  const [topPerforming, setTopPerforming] = useState<any[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [allStores, setAllStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, topPerformingData, statusData, activityData, allStoresData] = await Promise.all([
          storesService.getStats(),
          storesService.getTopPerforming(),
          storesService.getStatusBreakdown(),
          storesService.getRecentActivity(),
          storesService.getStores({ per_page: 10 }) // Get first 10 stores for the list
        ])
        setStats(statsData)
        setTopPerforming(topPerformingData.data)
        setStatusBreakdown(statusData)
        setRecentActivity(activityData.data)
        setAllStores(allStoresData.data)
      } catch (error) {
        console.error('Failed to fetch store data:', error)
        toast.error('Failed to load store data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{stats?.total_stores?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      {stats?.new_stores_today || 0} new today
                    </p>
                  </>
                )}
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
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{stats?.active_stores?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Currently active
                    </p>
                  </>
                )}
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
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>${stats?.revenue?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Total revenue
                    </p>
                  </>
                )}
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
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>${stats?.active_stores > 0 ? Math.round((stats?.revenue || 0) / stats.active_stores).toLocaleString() : 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Average per store
                    </p>
                  </>
                )}
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
                {loading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2' />
                    <span className='text-muted-foreground'>Loading stores...</span>
                  </div>
                ) : topPerforming.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No stores found
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {topPerforming.map((store, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>{store.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {store.views} views
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>${store.sales.toLocaleString()}</p>
                          <Badge variant='secondary'>Top performer</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {loading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2' />
                    <span className='text-muted-foreground'>Loading status...</span>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-3 h-3 rounded-full bg-green-500'></div>
                        <div>
                          <p className='font-medium'>Active Stores</p>
                          <p className='text-sm text-muted-foreground'>Currently running</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{statusBreakdown?.active || 0}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-3 h-3 rounded-full bg-red-500'></div>
                        <div>
                          <p className='font-medium'>Inactive Stores</p>
                          <p className='text-sm text-muted-foreground'>Not operational</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{statusBreakdown?.inactive || 0}</Badge>
                    </div>
                  </div>
                )}
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
                {loading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2' />
                    <span className='text-muted-foreground'>Loading activity...</span>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No recent activity
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {recentActivity.map((activity, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>{activity.name}</p>
                          <p className='text-sm text-muted-foreground'>{activity.action}</p>
                        </div>
                        <span className='text-sm text-muted-foreground'>{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )}
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
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin mr-2' />
                  <span className='text-muted-foreground'>Loading stores...</span>
                </div>
              ) : allStores.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No stores found
                </div>
              ) : (
                <div className='space-y-4'>
                  {allStores.map((store, index) => (
                    <div key={store.id} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                          <Store className='h-5 w-5 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium'>{store.name}</p>
                          <p className='text-sm text-muted-foreground flex items-center'>
                            <MapPin className='mr-1 h-3 w-3' />
                            {store.address || 'No address specified'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='text-right'>
                          <p className='font-medium'>${(store.id * 100 + 5000).toLocaleString()}</p>
                          <p className='text-sm text-muted-foreground'>
                            {store.operating_hours || 'Hours not set'}
                          </p>
                        </div>
                        <Badge variant={store.status === 1 ? 'default' : 'secondary'}>
                          {store.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
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