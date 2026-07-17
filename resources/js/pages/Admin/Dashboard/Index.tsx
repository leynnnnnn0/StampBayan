import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Building2, CreditCard, Stamp, TrendingUp, UserCheck, UserPlus, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Summary = {
  totalSignups: number;
  signupsThisMonth: number;
  activeUsers: number;
  totalBusinesses: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalStamps: number;
  totalLoyaltyCards: number;
  averageStampsPerDay: number;
};

type BusinessRow = {
  id: number;
  name: string;
  owner_username: string;
  owner_email: string;
  customers_count: number;
  new_customers_count: number;
  stamps_count: number;
  stamps_last_30_days: number;
  active_customers_count: number;
  loyalty_cards_count: number;
  average_stamps_per_day: number;
  created_at: string;
};

interface Props {
  summary: Summary;
  businesses: BusinessRow[];
}

type MetricCardProps = {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
};

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4 md:p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold leading-tight md:text-3xl">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:h-11 md:w-11">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Index({ summary, businesses }: Props) {
  return (
    <AppLayout>
      <Head title="Admin Dashboard" />

      <div className="space-y-5 md:space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Platform Overview</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Signups, active users, customers, stamps, loyalty cards, and business-level activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Signups" value={summary.totalSignups} subtitle="All registered business users" icon={UserPlus} />
          <MetricCard title="New Signups" value={summary.signupsThisMonth} subtitle="Registered this month" icon={TrendingUp} />
          <MetricCard title="Active Users" value={summary.activeUsers} subtitle="Signed in during the last 30 minutes" icon={UserCheck} />
          <MetricCard title="Businesses" value={summary.totalBusinesses} subtitle="Businesses on the platform" icon={Building2} />
          <MetricCard title="Customers" value={summary.totalCustomers} subtitle="Total customer accounts" icon={Users} />
          <MetricCard title="New Customers" value={summary.newCustomersThisMonth} subtitle="Customer signups this month" icon={Users} />
          <MetricCard title="Stamps Given" value={summary.totalStamps} subtitle="All-time issued stamps" icon={Stamp} />
          <MetricCard title="Avg Stamps/Day" value={summary.averageStampsPerDay} subtitle="Daily average over the last 30 days" icon={TrendingUp} />
          <MetricCard title="Loyalty Cards" value={summary.totalLoyaltyCards} subtitle="Cards created by businesses" icon={CreditCard} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Performance</CardTitle>
            <CardDescription>
              Customer count, new customers, stamps, loyalty cards, and average stamps per day for each business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-56">Business</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>New Customers</TableHead>
                    <TableHead>Active Customers</TableHead>
                    <TableHead>Stamps</TableHead>
                    <TableHead>Avg/Day</TableHead>
                    <TableHead>Loyalty Cards</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.length > 0 ? (
                    businesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{business.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {business.owner_username} · {business.owner_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{business.customers_count}</TableCell>
                        <TableCell>{business.new_customers_count}</TableCell>
                        <TableCell>{business.active_customers_count}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{business.stamps_count}</p>
                            <p className="text-xs text-muted-foreground">{business.stamps_last_30_days} last 30d</p>
                          </div>
                        </TableCell>
                        <TableCell>{business.average_stamps_per_day}</TableCell>
                        <TableCell>{business.loyalty_cards_count}</TableCell>
                        <TableCell>{formatDate(business.created_at)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        No businesses yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
