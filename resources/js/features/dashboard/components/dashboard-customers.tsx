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
import { Users, UserPlus, TrendingUp, DollarSign } from 'lucide-react'
import { topNav } from '../data/data'

export function DashboardCustomers() {
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
            <Button>
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
                <div className='text-2xl font-bold'>2,350</div>
                <p className='text-muted-foreground text-xs'>
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  New Customers
                </CardTitle>
                <UserPlus className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+573</div>
                <p className='text-muted-foreground text-xs'>
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Customer Growth
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+12.5%</div>
                <p className='text-muted-foreground text-xs'>
                  +2.1% from last month
                </p>
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
                <div className='text-2xl font-bold'>$89.50</div>
                <p className='text-muted-foreground text-xs'>
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Latest customer registrations and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  { name: 'Olivia Martin', email: 'olivia.martin@email.com', status: 'Active', joinDate: '2024-01-15' },
                  { name: 'Jackson Lee', email: 'jackson.lee@email.com', status: 'Active', joinDate: '2024-01-14' },
                  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', status: 'Pending', joinDate: '2024-01-13' },
                  { name: 'William Kim', email: 'william.kim@email.com', status: 'Active', joinDate: '2024-01-12' },
                  { name: 'Sofia Davis', email: 'sofia.davis@email.com', status: 'Suspended', joinDate: '2024-01-11' },
                ].map((customer, index) => (
                  <div key={index} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-primary'>
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className='font-medium'>{customer.name}</p>
                        <p className='text-sm text-muted-foreground'>{customer.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <Badge variant={
                        customer.status === 'Active' ? 'default' :
                        customer.status === 'Pending' ? 'secondary' : 'destructive'
                      }>
                        {customer.status}
                      </Badge>
                      <span className='text-sm text-muted-foreground'>{customer.joinDate}</span>
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
