import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    Gift,
    Percent,
    Stamp,
    TrendingUp,
    Trophy,
    Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Props {
    customersCount: number;
    newCustomersThisMonth: number;
    percentageChange: number;
    stampsUsedCountThisMonth: number;
    percentageChangeOnStamps: number;
    stampsByDayOfWeek: Array<{
        day: string;
        stamps: number;
    }>;
    repeatCustomerRate: Array<{
        week: string;
        oneVisit: number;
        twoToFive: number;
        sixPlus: number;
    }>;
    customerRetention: {
        activeThisMonth: number;
        returningThisMonth: number;
        inactive30: number;
        inactive60: number;
        inactive90: number;
        newVsReturning: Array<{
            month: string;
            new: number;
            returning: number;
        }>;
    };
    stampActivity: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        averagePerCustomer: number;
        dailyTrend: Array<{
            date: string;
            stamps: number;
        }>;
        topLoyaltyCards: Array<{
            name: string;
            stamps: number;
        }>;
    };
    rewardPerformance: {
        unlockedThisMonth: number;
        redeemedThisMonth: number;
        unclaimed: number;
        redemptionRate: number;
        popularPerks: Array<{
            reward: string;
            unlocked: number;
            redeemed: number;
        }>;
    };
    customerProgress: {
        closeToCompletion: number;
        averageCompletionProgress: number;
        completedThisMonth: number;
        repeatCompletions: number;
    };
}

type MetricCardProps = {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
};

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-3 p-4 md:p-5">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="mt-1 text-2xl leading-tight font-bold md:text-3xl">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:h-11 md:w-11">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </CardContent>
        </Card>
    );
}

function RankedList({
    items,
    emptyText,
    valueLabel,
}: {
    items: Array<{
        name?: string;
        reward?: string;
        stamps?: number;
        unlocked?: number;
        redeemed?: number;
    }>;
    emptyText: string;
    valueLabel: (item: {
        stamps?: number;
        unlocked?: number;
        redeemed?: number;
    }) => string;
}) {
    if (items.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div
                    key={`${item.name || item.reward}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {item.name || item.reward}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Rank #{index + 1}
                        </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                        {valueLabel(item)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function Index({
    customersCount,
    newCustomersThisMonth,
    percentageChange,
    stampsUsedCountThisMonth,
    percentageChangeOnStamps,
    stampsByDayOfWeek,
    repeatCustomerRate,
    customerRetention,
    stampActivity,
    rewardPerformance,
    customerProgress,
}: Props) {
    const dayChartConfig = {
        stamps: {
            label: 'Stamps Used',
            color: '#F6B733',
        },
    } satisfies ChartConfig;

    const retentionChartConfig = {
        oneVisit: {
            label: '1 Visit',
            color: '#CBD5E1',
        },
        twoToFive: {
            label: '2-5 Visits',
            color: '#60A5FA',
        },
        sixPlus: {
            label: '6+ Visits',
            color: '#F6B733',
        },
    } satisfies ChartConfig;

    const newVsReturningChartConfig = {
        new: {
            label: 'New',
            color: '#60A5FA',
        },
        returning: {
            label: 'Returning',
            color: '#F6B733',
        },
    } satisfies ChartConfig;

    const dailyStampChartConfig = {
        stamps: {
            label: 'Stamps',
            color: '#F6B733',
        },
    } satisfies ChartConfig;

    // Find the most popular day
    const mostPopularDay = stampsByDayOfWeek.reduce(
        (prev, current) => (current.stamps > prev.stamps ? current : prev),
        stampsByDayOfWeek[0],
    );

    return (
        <AppLayout>
            <Head title="Business Dashboard" />

            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Your business at a glance
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Loyalty activity, customer growth, and rewards.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/business/issue-stamp">Issue stamps</Link>
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Stamps today"
                        value={stampActivity.today}
                        subtitle={`${stampActivity.thisWeek} this week`}
                        icon={Stamp}
                    />
                    <MetricCard
                        title="Active customers"
                        value={customerRetention.activeThisMonth}
                        subtitle="Collected stamps this month"
                        icon={Users}
                    />
                    <MetricCard
                        title="New customers"
                        value={newCustomersThisMonth}
                        subtitle="Joined this month"
                        icon={TrendingUp}
                    />
                    <MetricCard
                        title="Unclaimed rewards"
                        value={rewardPerformance.unclaimed}
                        subtitle="Unlocked and not yet redeemed"
                        icon={Gift}
                    />
                </div>
                <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Loyalty activity</CardTitle>
                            <CardDescription>
                                Stamps collected each day · Last 14 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stampActivity.dailyTrend.some(
                                (day) => day.stamps > 0,
                            ) ? (
                                <ChartContainer
                                    config={dailyStampChartConfig}
                                    className="aspect-auto h-[240px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={stampActivity.dailyTrend}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={24}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            width={40}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar
                                            dataKey="stamps"
                                            fill="var(--color-stamps)"
                                            maxBarSize={36}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground">
                                    No stamp activity in the last 14 days. Issue
                                    stamps when customers make a qualifying
                                    purchase.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>What’s happening</CardTitle>
                            <CardDescription>
                                This month at a glance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <p className="text-sm">
                                <strong>
                                    {customerRetention.returningThisMonth}
                                </strong>{' '}
                                returning customers collected stamps this month.
                            </p>
                            <p className="text-sm">
                                <strong>
                                    {rewardPerformance.redeemedThisMonth}
                                </strong>{' '}
                                rewards redeemed this month.
                            </p>
                            <div className="flex flex-col gap-2 border-t pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/business/perk-claims">
                                        View reward claims
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/business/customers">
                                        View customers
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <details className="rounded-xl border bg-card p-4">
                    <summary className="cursor-pointer rounded-sm text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">
                        View detailed reports
                    </summary>
                    <div className="mt-6 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <MetricCard
                                title="Total customers"
                                value={customersCount}
                                subtitle="All registered customers"
                                icon={Users}
                            />
                            <MetricCard
                                title="New customers"
                                value={newCustomersThisMonth}
                                subtitle={`${percentageChange}% change vs last month`}
                                icon={TrendingUp}
                            />
                            <MetricCard
                                title="Stamps this month"
                                value={stampsUsedCountThisMonth}
                                subtitle={`${percentageChangeOnStamps}% change vs last month`}
                                icon={Stamp}
                            />
                        </div>
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Customer Retention
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    See who is active, returning, or starting to
                                    go quiet.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    title="Active Customers"
                                    value={customerRetention.activeThisMonth}
                                    subtitle="Had stamp activity this month"
                                    icon={Users}
                                />
                                <MetricCard
                                    title="Returning Customers"
                                    value={customerRetention.returningThisMonth}
                                    subtitle="Active this month with prior visits"
                                    icon={TrendingUp}
                                />
                                <MetricCard
                                    title="Inactive 30 Days"
                                    value={customerRetention.inactive30}
                                    subtitle="No recent stamp activity"
                                    icon={Users}
                                />
                                <MetricCard
                                    title="Inactive 90 Days"
                                    value={customerRetention.inactive90}
                                    subtitle="Needs re-engagement"
                                    icon={Users}
                                />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        New vs Returning Customers
                                    </CardTitle>
                                    <CardDescription>
                                        Monthly active customers grouped by
                                        visit history
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={newVsReturningChartConfig}
                                        className="aspect-auto h-[260px] w-full sm:h-[300px]"
                                    >
                                        <BarChart
                                            accessibilityLayer
                                            data={
                                                customerRetention.newVsReturning
                                            }
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Bar
                                                dataKey="new"
                                                stackId="customers"
                                                fill="var(--color-new)"
                                                maxBarSize={64}
                                                radius={[0, 0, 4, 4]}
                                            />
                                            <Bar
                                                dataKey="returning"
                                                stackId="customers"
                                                fill="var(--color-returning)"
                                                maxBarSize={64}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Stamp Activity
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Track stamp volume and the loyalty cards
                                    driving it.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    title="Today"
                                    value={stampActivity.today}
                                    subtitle="Stamps issued today"
                                    icon={Stamp}
                                />
                                <MetricCard
                                    title="This Week"
                                    value={stampActivity.thisWeek}
                                    subtitle="Stamps issued this week"
                                    icon={Stamp}
                                />
                                <MetricCard
                                    title="This Month"
                                    value={stampActivity.thisMonth}
                                    subtitle="Stamps issued this month"
                                    icon={Stamp}
                                />
                                <MetricCard
                                    title="Avg. Per Customer"
                                    value={stampActivity.averagePerCustomer}
                                    subtitle="Monthly active customers"
                                    icon={Percent}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-3">
                                <Card className="xl:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Daily Stamp Trend</CardTitle>
                                        <CardDescription>
                                            Last 14 days of issued stamps
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer
                                            config={dailyStampChartConfig}
                                            className="aspect-auto h-[260px] w-full sm:h-[300px]"
                                        >
                                            <BarChart
                                                accessibilityLayer
                                                data={stampActivity.dailyTrend}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent />
                                                    }
                                                />
                                                <Bar
                                                    dataKey="stamps"
                                                    fill="var(--color-stamps)"
                                                    maxBarSize={44}
                                                    radius={8}
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Loyalty Cards</CardTitle>
                                        <CardDescription>
                                            Most active cards in the last 30
                                            days
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RankedList
                                            items={
                                                stampActivity.topLoyaltyCards
                                            }
                                            emptyText="No stamp activity yet."
                                            valueLabel={(item) =>
                                                `${item.stamps || 0} stamps`
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Reward Performance
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Measure unlocks, redemptions, and reward
                                    demand.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    title="Unlocked"
                                    value={rewardPerformance.unlockedThisMonth}
                                    subtitle="Rewards unlocked this month"
                                    icon={Gift}
                                />
                                <MetricCard
                                    title="Redeemed"
                                    value={rewardPerformance.redeemedThisMonth}
                                    subtitle="Rewards redeemed this month"
                                    icon={Award}
                                />
                                <MetricCard
                                    title="Unclaimed"
                                    value={rewardPerformance.unclaimed}
                                    subtitle="Rewards waiting to be claimed"
                                    icon={Gift}
                                />
                                <MetricCard
                                    title="Redemption Rate"
                                    value={`${rewardPerformance.redemptionRate}%`}
                                    subtitle="All-time redeemed vs unlocked"
                                    icon={Percent}
                                />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Most Popular Perks</CardTitle>
                                    <CardDescription>
                                        Rewards customers unlock most often
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RankedList
                                        items={rewardPerformance.popularPerks}
                                        emptyText="No rewards unlocked yet."
                                        valueLabel={(item) =>
                                            `${item.unlocked || 0} unlocked`
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Customer Progress
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Understand who is close to completing cards
                                    and how often cards are completed.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    title="Near Completion"
                                    value={customerProgress.closeToCompletion}
                                    subtitle="Customers at 80%+ progress"
                                    icon={Users}
                                />
                                <MetricCard
                                    title="Average Progress"
                                    value={`${customerProgress.averageCompletionProgress}%`}
                                    subtitle="Across active customer cards"
                                    icon={Percent}
                                />
                                <MetricCard
                                    title="Completed This Month"
                                    value={customerProgress.completedThisMonth}
                                    subtitle="Completed loyalty cards"
                                    icon={Trophy}
                                />
                                <MetricCard
                                    title="Repeat Completions"
                                    value={customerProgress.repeatCompletions}
                                    subtitle="Customers completing cards again"
                                    icon={Trophy}
                                />
                            </div>
                        </section>

                        {/* Charts - stack on mobile, 2 columns on large screens */}
                        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
                            {/* Customer Traffic by Day of Week */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Customer Traffic by Day
                                    </CardTitle>
                                    <CardDescription>
                                        Stamps used per day of the week
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={dayChartConfig}
                                        className="aspect-auto h-[260px] w-full sm:h-[300px]"
                                    >
                                        <BarChart
                                            accessibilityLayer
                                            data={stampsByDayOfWeek}
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="day"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Bar
                                                dataKey="stamps"
                                                fill="var(--color-stamps)"
                                                maxBarSize={52}
                                                radius={8}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-2 text-sm">
                                    <div className="flex gap-2 leading-none font-medium">
                                        Busiest day: {mostPopularDay?.day}{' '}
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div className="leading-none text-muted-foreground">
                                        Plan staffing and inventory based on
                                        peak days
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Customer Visit Frequency */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Customer Visit Frequency
                                    </CardTitle>
                                    <CardDescription>
                                        How often customers return (Weekly)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={retentionChartConfig}
                                        className="aspect-auto h-[260px] w-full sm:h-[300px]"
                                    >
                                        <BarChart
                                            accessibilityLayer
                                            data={repeatCustomerRate}
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="week"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent />
                                                }
                                            />
                                            <Bar
                                                dataKey="oneVisit"
                                                fill="var(--color-oneVisit)"
                                                maxBarSize={52}
                                                radius={[0, 0, 4, 4]}
                                                stackId="a"
                                            />
                                            <Bar
                                                dataKey="twoToFive"
                                                fill="var(--color-twoToFive)"
                                                maxBarSize={52}
                                                radius={[0, 0, 0, 0]}
                                                stackId="a"
                                            />
                                            <Bar
                                                dataKey="sixPlus"
                                                fill="var(--color-sixPlus)"
                                                maxBarSize={52}
                                                radius={[4, 4, 0, 0]}
                                                stackId="a"
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-2 text-sm">
                                    <div className="flex gap-2 leading-none font-medium">
                                        Track repeat customer behavior{' '}
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div className="leading-none text-muted-foreground">
                                        Higher repeat visits indicate strong
                                        customer loyalty
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </details>
            </div>
        </AppLayout>
    );
}
