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
import { Megaphone, Plus, TrendingUp, DollarSign, Eye, MousePointer, Calendar } from 'lucide-react'
import { topNav } from '../data/data'

export function DashboardAdvertisement() {
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
                <div className='text-2xl font-bold'>156</div>
                <p className='text-muted-foreground text-xs'>
                  +12 new ads this month
                </p>
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
                <div className='text-2xl font-bold'>23</div>
                <p className='text-muted-foreground text-xs'>
                  +3.2% from last month
                </p>
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
                <div className='text-2xl font-bold'>$45.2K</div>
                <p className='text-muted-foreground text-xs'>
                  +18.5% from last month
                </p>
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
                <div className='text-2xl font-bold'>3.2%</div>
                <p className='text-muted-foreground text-xs'>
                  +0.5% from last month
                </p>
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
                <div className='space-y-3'>
                  {[
                    { name: 'Summer Sale Banner', views: '125K', clicks: '4.2K', ctr: '3.4%' },
                    { name: 'New Product Launch', views: '98K', clicks: '3.1K', ctr: '3.2%' },
                    { name: 'Holiday Special', views: '156K', clicks: '4.8K', ctr: '3.1%' },
                    { name: 'Mobile App Download', views: '87K', clicks: '2.6K', ctr: '3.0%' },
                    { name: 'Brand Awareness', views: '203K', clicks: '5.9K', ctr: '2.9%' },
                  ].map((ad, index) => (
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
                <div className='space-y-3'>
                  {[
                    { name: 'Active Campaigns', count: 23, status: 'Active', color: 'bg-green-500' },
                    { name: 'Paused', count: 5, status: 'Paused', color: 'bg-yellow-500' },
                    { name: 'Completed', count: 12, status: 'Completed', color: 'bg-blue-500' },
                    { name: 'Draft', count: 8, status: 'Draft', color: 'bg-gray-500' },
                  ].map((campaign, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className={`w-3 h-3 rounded-full ${campaign.color}`}></div>
                        <div>
                          <p className='font-medium'>{campaign.name}</p>
                          <p className='text-sm text-muted-foreground'>{campaign.status}</p>
                        </div>
                      </div>
                      <Badge variant='outline'>{campaign.count}</Badge>
                    </div>
                  ))}
                </div>
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
                <div className='space-y-3'>
                  {[
                    { name: 'Summer Sale Banner', action: 'Reached 100K views', time: '2 hours ago' },
                    { name: 'New Product Launch', action: 'Campaign optimized', time: '4 hours ago' },
                    { name: 'Holiday Special', action: 'Budget increased', time: '6 hours ago' },
                    { name: 'Mobile App Download', action: 'New creative added', time: '1 day ago' },
                    { name: 'Brand Awareness', action: 'Targeting updated', time: '2 days ago' },
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
                    <p className='text-2xl font-bold'>2.4M</p>
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
                    <p className='text-2xl font-bold'>76.8K</p>
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
                    <p className='text-2xl font-bold'>$0.59</p>
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
                {[
                  { name: 'Black Friday Sale', date: 'Nov 24, 2024', budget: '$15,000', status: 'Scheduled' },
                  { name: 'Christmas Campaign', date: 'Dec 1, 2024', budget: '$25,000', status: 'Scheduled' },
                  { name: 'New Year Promotion', date: 'Jan 1, 2025', budget: '$12,000', status: 'Draft' },
                  { name: 'Valentine\'s Day', date: 'Feb 14, 2025', budget: '$8,000', status: 'Draft' },
                ].map((campaign, index) => (
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
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
