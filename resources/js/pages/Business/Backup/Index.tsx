import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    Check,
    Clock3,
    DatabaseBackup,
    Download,
    ExternalLink,
    FileDown,
    History,
    MessageCircle,
    QrCode,
    RefreshCw,
    ShieldCheck,
    TriangleAlert,
} from 'lucide-react';

type Subscription = {
    active: boolean;
    activated_at: string | null;
    expires_at: string | null;
    expires_at_formatted: string | null;
    days_remaining: number;
};

type Props = {
    businessName: string;
    subscription: Subscription;
    paymentState: string;
    facebookUrl: string;
    price: number;
    backupTimes: string[];
};

const protectionFeatures = [
    {
        value: 'twice-daily',
        icon: Clock3,
        title: 'Two automatic restore points every day',
        summary: 'Your database backup process runs at 8:00 AM and 10:00 PM.',
        details:
            'Two scheduled restore points reduce the amount of business activity exposed between backups. The morning copy protects the start of your operating day, while the evening copy protects the latest customer, stamp, reward, loyalty-card, and configuration changes.',
    },
    {
        value: 'lifetime-history',
        icon: History,
        title: 'Every daily restore point is retained',
        summary: 'Your successful restore-point history stays available for the lifetime of the business account.',
        details:
            'A new backup does not replace the previous one. This creates a historical timeline that can help locate a clean version from before an accidental deletion or damaging change. Backups pause when protection expires, but previously completed restore points remain in the retained account history.',
    },
    {
        value: 'database-recovery',
        icon: DatabaseBackup,
        title: 'Database-level accidental-deletion recovery',
        summary: 'Recover more than a basic spreadsheet or PDF can reconstruct.',
        details:
            'The paid plan is designed for restoration of connected business records such as loyalty cards, customer stamp activity, reward information, and related database relationships. This is especially valuable when a loyalty card or other important record is deleted accidentally and a basic customer list is not enough to rebuild it correctly.',
    },
    {
        value: 'admin-assisted',
        icon: MessageCircle,
        title: 'Admin-assisted restoration through Facebook',
        summary: 'Tell us what happened and the approximate incident date so we can find the appropriate restore point.',
        details:
            'Restoration is handled by the StampBayan administrator to reduce the risk of overwriting the wrong records. The business owner contacts support through Facebook, describes what was deleted or changed, and provides the approximate date and time. Ownership and the requested recovery point are verified before any restoration is performed.',
    },
    {
        value: 'monthly-access',
        icon: CalendarClock,
        title: 'Simple 30-day protection period',
        summary: 'One ₱99 QR Ph payment activates protection for 30 days. There is no automatic renewal.',
        details:
            'Pay through PayMongo using QR Ph and the verified payment webhook activates the plan automatically. StampBayan sends reminders as expiration approaches. If the plan is not renewed, new scheduled backups pause at expiration and resume after the next successful payment.',
    },
];

export default function Index({
    businessName,
    subscription,
    paymentState,
    facebookUrl,
    price,
    backupTimes,
}: Props) {
    const { flash } = usePage<SharedData>().props;

    const beginCheckout = () => {
        router.post('/business/backups/checkout', {}, { preserveScroll: true });
    };

    const needsRenewalSoon = subscription.active && subscription.days_remaining <= 7;

    return (
        <AppLayout>
            <Head title="Backups" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                        <ShieldCheck className="size-4" />
                        Business continuity
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Backups</h1>
                    <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                        Export a basic customer summary anytime, or protect {businessName} with twice-daily database restore points.
                    </p>
                </div>

                {flash?.error && (
                    <Alert variant="destructive">
                        <TriangleAlert className="size-4" />
                        <AlertTitle>Payment unavailable</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {paymentState === 'processing' && (
                    <Alert className="border-blue-200 bg-blue-50 text-blue-950">
                        <RefreshCw className="size-4" />
                        <AlertTitle>Payment confirmation in progress</AlertTitle>
                        <AlertDescription>
                            PayMongo is confirming your QR Ph payment. Protection activates automatically after the verified payment notification arrives.
                        </AlertDescription>
                    </Alert>
                )}

                {paymentState === 'cancelled' && (
                    <Alert>
                        <QrCode className="size-4" />
                        <AlertTitle>Payment was not completed</AlertTitle>
                        <AlertDescription>No charge was recorded. You can open a new QR Ph checkout whenever you are ready.</AlertDescription>
                    </Alert>
                )}

                {needsRenewalSoon && (
                    <Alert className="border-amber-300 bg-amber-50 text-amber-950">
                        <CalendarClock className="size-4" />
                        <AlertTitle>
                            Protection expires in {subscription.days_remaining} {subscription.days_remaining === 1 ? 'day' : 'days'}
                        </AlertTitle>
                        <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span>Renew now to keep the 8:00 AM and 10:00 PM backup schedule uninterrupted.</span>
                            <Button size="sm" onClick={beginCheckout}>Renew for ₱{price}</Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
                    <Card>
                        <CardHeader>
                            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-slate-100">
                                <FileDown className="size-5" />
                            </div>
                            <CardTitle>Basic customer backup</CardTitle>
                            <CardDescription>Free for every StampBayan business account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">PDF contents</p>
                                <div className="space-y-2 text-sm">
                                    {['Customer Name', 'Loyalty Card', 'Number of Stamps'].map((item) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <Check className="size-4 text-green-600" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">
                                This branded PDF is useful for reference and manual record keeping. It cannot restore deleted database relationships, settings, or complete transaction history.
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <a href="/business/backups/basic-export">
                                    <Download className="size-4" />
                                    Download Basic PDF
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-amber-300 shadow-sm">
                        <div className="h-1.5 bg-amber-400" />
                        <CardHeader>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Badge className={subscription.active ? 'bg-green-600 hover:bg-green-600' : 'bg-amber-400 text-black hover:bg-amber-400'}>
                                            {subscription.active ? 'Protection active' : 'Recommended protection'}
                                        </Badge>
                                        <Badge variant="outline">Not auto-renewing</Badge>
                                    </div>
                                    <CardTitle className="text-2xl">StampBayan Data Protection</CardTitle>
                                    <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
                                        Database-level restore points that help your business recover from accidental deletions and damaging changes.
                                    </CardDescription>
                                </div>
                                <div className="shrink-0 sm:text-right">
                                    <div className="text-3xl font-black">₱{price}</div>
                                    <div className="text-sm text-muted-foreground">for 30 days</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {subscription.active ? (
                                <div className="grid gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Status</p>
                                        <p className="mt-1 font-bold text-green-950">Backups enabled</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Daily schedule</p>
                                        <p className="mt-1 font-bold text-green-950">{backupTimes.join(' & ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Protected until</p>
                                        <p className="mt-1 font-bold text-green-950">{subscription.expires_at_formatted}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="font-semibold text-amber-950">Automatic database backups are currently paused.</p>
                                    <p className="mt-1 text-sm leading-6 text-amber-900">
                                        Activate protection to begin restore points every day at 8:00 AM and 10:00 PM. Every completed restore point is retained for your account’s lifetime.
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-2 sm:grid-cols-2">
                                <Button size="lg" onClick={beginCheckout} className="bg-amber-400 text-black hover:bg-amber-500">
                                    <QrCode className="size-5" />
                                    {subscription.active ? `Add 30 Days for ₱${price}` : `Pay ₱${price} with QR Ph`}
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <a href={facebookUrl} target="_blank" rel="noreferrer">
                                        <MessageCircle className="size-5" />
                                        Request Restoration
                                        <ExternalLink className="size-4" />
                                    </a>
                                </Button>
                            </div>

                            <p className="text-center text-xs leading-5 text-muted-foreground">
                                Payment is processed securely on PayMongo’s hosted checkout using QR Ph. Access activates automatically after verified payment confirmation.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>What paid protection includes</CardTitle>
                        <CardDescription>Open each item for a clear explanation of how the protection works.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {protectionFeatures.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <AccordionItem key={feature.value} value={feature.value}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <span className="flex items-start gap-3 pr-3">
                                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                                    <Icon className="size-4" />
                                                </span>
                                                <span>
                                                    <span className="block font-semibold">{feature.title}</span>
                                                    <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{feature.summary}</span>
                                                </span>
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-12 leading-6 text-muted-foreground">
                                            {feature.details}
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
