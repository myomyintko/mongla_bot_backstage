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
import { Megaphone, Plus, TrendingUp, DollarSign, Eye, MousePointer, Calendar, Loader2 } from 'lucide-react'
import { topNav } from '../data/data'
import { useEffect, useState } from 'react'
import { advertisementsService } from '@/services/advertisements-service'
import { toast } from 'sonner'

export function DashboardAdvertisement() {
  const [stats, setStats] = useState<any>(null)
  const [topPerforming, setTopPerforming] = useState<any[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, topPerformingData, statusData, activityData, metricsData, upcomingData] = await Promise.all([
          advertisementsService.getStats(),
          advertisementsService.getTopPerforming(),
          advertisementsService.getStatusBreakdown(),
          advertisementsService.getRecentActivity(),
          advertisementsService.getMetrics(),
          advertisementsService.getUpcoming()
        ])
        setStats(statsData)
        setTopPerforming(topPerformingData.data)
        setStatusBreakdown(statusData)
        setRecentActivity(activityData.data)
        setMetrics(metricsData)
        setUpcoming(upcomingData.data)
      } catch (error) {
        console.error('Failed to fetch advertisement data:', error)
        toast.error('Failed to load advertisement data')
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
          <h1 className='text-2xl font-bold tracking-tight'>Advertisement Management</h1>
          <div className='flex items-center space-x-2'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Create Ad
            </Button>
          </div>
        </div>
        
        <div className='space-y-4'>
          {/* Advertisement Stats */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Ads
                </CardTitle>
                <Megaphone className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{stats?.total_ads?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Total advertisements
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Campaigns
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
                    <div className='text-2xl font-bold'>{stats?.active_ads?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Currently running
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Spend
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
                    <div className='text-2xl font-bold'>${stats?.total_spend?.toLocaleString() || 0}</div>
                    <p className='text-muted-foreground text-xs'>
                      Total budget spent
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Click Rate
                </CardTitle>
                <MousePointer className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm text-muted-foreground'>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{stats?.click_rate || 0}%</div>
                    <p className='text-muted-foreground text-xs'>
                      Average click rate
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Advertisement Performance */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Ads</CardTitle>
                <CardDescription>
                  Ads with highest engagement and conversion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2' />
                    <span className='text-muted-foreground'>Loading ads...</span>
                  </div>
                ) : topPerforming.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No advertisements found
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {topPerforming.map((ad, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>{ad.name}</p>
                          <p className='text-sm text-muted-foreground'>{ad.views} views</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{ad.clicks} clicks</p>
                          <Badge variant='secondary'>{ad.ctr}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Status</CardTitle>
                <CardDescription>
                  Current status of all advertising campaigns
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
                          <p className='font-medium'>Active Campaigns</p>
                          <p className='text-sm text-muted-foreground'>Running</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{statusBreakdown?.active || 0}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                        <div>
                          <p className='font-medium'>Paused</p>
                          <p className='text-sm text-muted-foreground'>Paused</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{statusBreakdown?.paused || 0}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                        <div>
                          <p className='font-medium'>Completed</p>
                          <p className='text-sm text-muted-foreground'>Finished</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{statusBreakdown?.completed || 0}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-3 h-3 rounded-full bg-gray-500'></div>
                        <div>
                          <p className='font-medium'>Draft</p>
                          <p className='text-sm text-muted-foreground'>Not started</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{statusBreakdown?.draft || 0}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Ad Activity</CardTitle>
                <CardDescription>
                  Latest advertisement updates and performance
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

          {/* Advertisement Analytics */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Ad Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for your advertisements
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <Eye className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='font-medium'>Impressions</p>
                      <p className='text-sm text-muted-foreground'>Total views across all ads</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-bold'>{loading ? '-' : metrics?.impressions?.toLocaleString() || 0}</p>
                    <p className='text-sm text-green-600'>+12.5%</p>
                  </div>
                </div>
                
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <MousePointer className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='font-medium'>Clicks</p>
                      <p className='text-sm text-muted-foreground'>Total clicks on advertisements</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-bold'>{loading ? '-' : metrics?.clicks?.toLocaleString() || 0}</p>
                    <p className='text-sm text-green-600'>+8.2%</p>
                  </div>
                </div>
                
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <DollarSign className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='font-medium'>Cost Per Click</p>
                      <p className='text-sm text-muted-foreground'>Average cost per click</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-bold'>${loading ? '-' : metrics?.cpc?.toFixed(2) || '0.00'}</p>
                    <p className='text-sm text-red-600'>-3.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Campaigns</CardTitle>
                <CardDescription>
                  Scheduled advertisements and campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {loading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2' />
                    <span className='text-muted-foreground'>Loading campaigns...</span>
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No upcoming campaigns
                  </div>
                ) : (
                  upcoming.map((campaign, index) => (
                    <div key={index} className='flex items-center justify-between p-3 border rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{campaign.name}</p>
                          <p className='text-sm text-muted-foreground'>{campaign.date}</p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{campaign.budget}</p>
                        <Badge variant={
                          campaign.status === 'Scheduled' ? 'default' : 'secondary'
                        }>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
