import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, BarChart3, Clock, MousePointerClick, TrendingDown, Users } from 'lucide-react';

type Summary = {
    total_businesses: number;
    active_businesses: number;
    activation_rate: number;
    total_customers: number;
    used_stamps_30_days: number;
};

type FunnelStep = {
    label: string;
    count: number;
    conversion: number;
    dropoff: number;
};

type TopPage = {
    path: string;
    views: number;
};

type TopClick = {
    label: string;
    path: string;
    clicks: number;
};

type TimeByPage = {
    path: string;
    average_seconds: number;
    samples: number;
};

type DropOffPage = {
    path: string;
    exits: number;
};

type BusinessProgress = {
    id: number;
    name: string;
    owner_email?: string | null;
    signed_up_at?: string | null;
    days_since_signup?: number | null;
    created_cards: number;
    customers: number;
    used_stamps: number;
    first_stamp_at?: string | null;
    last_seen_at?: string | null;
    last_seen_path?: string | null;
    stage: string;
};

type Props = {
    summary: Summary;
    funnel: FunnelStep[];
    topPages: TopPage[];
    topClicks: TopClick[];
    timeByPage: TimeByPage[];
    dropOffPages: DropOffPage[];
    businessProgress: BusinessProgress[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Analytics',
        href: '/admin/product-analytics',
    },
];

function formatDate(value?: string | null) {
    if (!value) {
        return 'Never';
    }

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function stageTone(stage: string) {
    if (stage === 'Active') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (stage === 'Needs first stamp') {
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }

    return 'border-slate-200 bg-slate-50 text-slate-700';
}

export default function ProductAnalytics({
    summary,
    funnel,
    topPages,
    topClicks,
    timeByPage,
    dropOffPages,
    businessProgress,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Analytics" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="flex flex-col gap-3">
                    <Badge variant="outline" className="w-fit border-[#F8BC3B]/40 bg-[#F8BC3B]/10 text-[#c88900]">
                        Admin dashboard
                    </Badge>
                    <div className="max-w-3xl">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Product Analytics</h1>
                        <p className="mt-2 text-base text-slate-600">
                            See how businesses move from sign up to real usage, where they stop, and which actions get the most engagement.
                        </p>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard title="Businesses" value={summary.total_businesses} icon={Users} note="Total sign ups" />
                    <MetricCard title="Active" value={summary.active_businesses} icon={Activity} note="Issued stamps in 30 days" />
                    <MetricCard title="Activation" value={`${summary.activation_rate}%`} icon={BarChart3} note="Active / sign ups" />
                    <MetricCard title="Customers" value={summary.total_customers} icon={Users} note="Customer accounts" />
                    <MetricCard title="Recent stamps" value={summary.used_stamps_30_days} icon={MousePointerClick} note="Last 30 days" />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Activation funnel</CardTitle>
                            <CardDescription>Where businesses are dropping before they become active.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {funnel.map((step, index) => (
                                <div key={step.label} className="space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-slate-950">{step.label}</p>
                                            {index > 0 && (
                                                <p className="text-xs text-slate-500">
                                                    {step.dropoff} stopped after the previous step
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-950">{step.count}</p>
                                            <p className="text-xs text-slate-500">{step.conversion}% conversion</p>
                                        </div>
                                    </div>
                                    <Progress value={Math.min(step.conversion, 100)} className="h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-[#F8BC3B]" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="size-5 text-[#F8BC3B]" />
                                Drop-off pages
                            </CardTitle>
                            <CardDescription>The last tracked page in recent sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleRankedList
                                empty="No drop-off data yet."
                                rows={dropOffPages.map((page) => ({
                                    title: page.path,
                                    meta: `${page.exits} exits`,
                                }))}
                            />
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <InsightCard
                        title="Top pages"
                        description="Most visited pages in the last 30 days."
                        empty="No page views yet."
                        rows={topPages.map((page) => ({
                            title: page.path,
                            meta: `${page.views} views`,
                        }))}
                    />
                    <InsightCard
                        title="Top clicks"
                        description="Buttons and links businesses interact with most."
                        empty="No clicks yet."
                        rows={topClicks.map((click) => ({
                            title: click.label,
                            meta: `${click.clicks} clicks on ${click.path}`,
                        }))}
                    />
                    <InsightCard
                        title="Time on page"
                        description="Average time before users navigate away."
                        empty="No time data yet."
                        rows={timeByPage.map((page) => ({
                            title: page.path,
                            meta: `${page.average_seconds}s average from ${page.samples} samples`,
                        }))}
                        icon={Clock}
                    />
                </section>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>Business onboarding status</CardTitle>
                        <CardDescription>
                            The fastest way to find accounts that signed up but never got to useful activity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                                        <th className="py-3 pr-4">Business</th>
                                        <th className="py-3 pr-4">Stage</th>
                                        <th className="py-3 pr-4">Cards</th>
                                        <th className="py-3 pr-4">Customers</th>
                                        <th className="py-3 pr-4">Stamps</th>
                                        <th className="py-3 pr-4">Last seen</th>
                                        <th className="py-3 pr-4">Last page</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {businessProgress.map((business) => (
                                        <tr key={business.id} className="border-b last:border-0">
                                            <td className="py-4 pr-4">
                                                <p className="font-semibold text-slate-950">{business.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {business.owner_email ?? 'No owner email'} · {business.days_since_signup ?? 0} days old
                                                </p>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${stageTone(business.stage)}`}>
                                                    {business.stage}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-slate-700">{business.created_cards}</td>
                                            <td className="py-4 pr-4 text-slate-700">{business.customers}</td>
                                            <td className="py-4 pr-4 text-slate-700">{business.used_stamps}</td>
                                            <td className="py-4 pr-4 text-slate-700">{formatDate(business.last_seen_at)}</td>
                                            <td className="max-w-[240px] truncate py-4 pr-4 text-slate-600">{business.last_seen_path ?? 'No tracked page yet'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function MetricCard({ title, value, note, icon: Icon }: { title: string; value: number | string; note: string; icon: typeof Users }) {
    return (
        <Card className="rounded-lg">
            <CardContent className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{note}</p>
                </div>
                <div className="grid size-11 place-items-center rounded-lg bg-[#F8BC3B]/15 text-[#c88900]">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function InsightCard({
    title,
    description,
    rows,
    empty,
    icon: Icon = BarChart3,
}: {
    title: string;
    description: string;
    rows: { title: string; meta: string }[];
    empty: string;
    icon?: typeof BarChart3;
}) {
    return (
        <Card className="rounded-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="size-5 text-[#F8BC3B]" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <SimpleRankedList rows={rows} empty={empty} />
            </CardContent>
        </Card>
    );
}

function SimpleRankedList({ rows, empty }: { rows: { title: string; meta: string }[]; empty: string }) {
    if (rows.length === 0) {
        return <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">{empty}</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((row, index) => (
                <div key={`${row.title}-${index}`} className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                        {index + 1}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{row.title}</p>
                        <p className="text-xs text-slate-500">{row.meta}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
