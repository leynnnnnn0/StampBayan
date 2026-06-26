import { Head, router, usePage } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type SharedData } from '@/types';
import Article from "../../images/article.jpg";
import StampBayanMap from "./StampBayanMap";
import {
    ArrowRight,
    BadgeDollarSign,
    BarChart3,
    Bell,
    Box,
    CalendarDays,
    Check,
    ChevronDown,
    Chrome,
    CircleDollarSign,
    ClipboardList,
    Clock3,
    Code2,
    Download,
    Gift,
    FileSearch,
    Globe2,
    IdCard,
    Instagram,
    LayoutGrid,
    Menu,
    MessageCircle,
    PackageSearch,
    PieChart,
    Play,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Stamp,
    Store,
    Target,
    Ticket,
    TrendingUp,
    Users,
    WandSparkles,
    X,
    Youtube,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import dashboardSnapshot from '../../images/documentation/dashboard.png';
import MainLogo from '../../../public/images/mainLogo.png';
const navItems = [
    { label: 'Platform', hasDropdown: true },
    { label: 'Resources', hasDropdown: true },
    { label: 'Pricing', href: '/pricing' },
];

const navDropdownLinks: Record<string, { label: string; href: string }[]> = {
    Platform: [
        { label: 'Admin Login', href: '/login' },
        { label: 'Staff Login', href: '/staff/login' },
        { label: 'Customer Login', href: '/customer/login' },
    ],
    Resources: [
        { label: 'Documentation', href: '/documentation' },
        { label: 'Latest Articles', href: '#latest-articles' },
        { label: 'Business Map', href: '#business-map' },
    ],
};

const productCards = [
    {
        name: 'Stamp Cards',
        price: 'Free setup',
        revenue: 'Unlimited',
        icon: ClipboardList,
        tint: 'from-amber-100 to-orange-50',
    },
    {
        name: 'QR Code Scanning',
        price: 'Fast check-in',
        revenue: 'No paper',
        icon: Target,
        tint: 'from-rose-100 to-red-50',
    },
    {
        name: 'Customer Profiles',
        price: 'Auto saved',
        revenue: 'Live data',
        icon: Store,
        tint: 'from-cyan-100 to-blue-50',
    },
    {
        name: 'Reward Claims',
        price: 'Easy redeem',
        revenue: 'Tracked',
        icon: BadgeDollarSign,
        tint: 'from-pink-100 to-violet-50',
    },
    {
        name: 'Staff Access',
        price: 'Role ready',
        revenue: 'Secure',
        icon: ShieldCheck,
        tint: 'from-lime-100 to-emerald-50',
    },
    {
        name: 'Visit Analytics',
        price: 'Daily trends',
        revenue: 'Insights',
        icon: BarChart3,
        tint: 'from-sky-100 to-indigo-50',
    },
    {
        name: 'Perk Alerts',
        price: 'Instant updates',
        revenue: 'Ready',
        icon: Bell,
        tint: 'from-purple-100 to-fuchsia-50',
    },
    {
        name: 'QR Studio',
        price: 'Brandable',
        revenue: 'Printable',
        icon: LayoutGrid,
        tint: 'from-emerald-100 to-teal-50',
    },
    {
        name: 'Offline Stamp Codes',
        price: 'Backup ready',
        revenue: 'Synced',
        icon: FileSearch,
        tint: 'from-orange-100 to-yellow-50',
    },
];

const authChoices = [
    { label: 'Customer', signIn: '/customer/login', signUp: '/customer/register' },
    { label: 'Business', signIn: '/login', signUp: '/register' },
];

const footerLinks = [
    {
        title: 'Platform',
        links: [
            { label: 'Staff Login', href: '/staff/login' },
            { label: 'Admin Login', href: '/login' },
            { label: 'Customer Login', href: '/customer/login' },
        ],
    },
    {
        title: 'Business Tools',
        links: [
            { label: 'Card Templates', href: '#' },
            { label: 'Customer List', href: '#' },
            { label: 'Stamp Codes', href: '#' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'Pricing', href: '/pricing' },
            { label: 'About', href: '#' },
            { label: 'Contact', href: '#' },
        ],
    },
];

const toolIcons = [
    { icon: LayoutGrid, color: 'bg-red-500', label: 'Dashboard' },
    { icon: Stamp, color: 'bg-violet-600', label: 'Issue Stamp' },
    { icon: Gift, color: 'bg-neutral-900', label: 'Perk Claims' },
    { icon: Code2, color: 'bg-blue-500', label: 'Stamp Codes' },
    { icon: IdCard, color: 'bg-emerald-500', label: 'Card Templates' },
    { icon: Users, color: 'bg-red-500', label: 'Customers', large: false },
    { icon: Search, color: 'bg-yellow-400', label: 'QR Studio' },
    { icon: WandSparkles, color: 'bg-orange-500', label: 'QR Design' },
    { icon: Ticket, color: 'bg-blue-500', label: 'Tickets' },
    { icon: MessageCircle, color: 'bg-pink-500', label: 'Support' },
];

import LoyaltyCard from '../../images/program.png';
import Quick from '../../images/quick.png';
import Track from '../../images/folder.png';
import Insights from '../../images/metrics.png';
import Mobile from '../../images/mobile-friendly.png';
import Organized from '../../images/binder.png';
import Phone from '../../images/phone.png';
const perks = [
    {
        icon: Sparkles,
        title: 'Paperless loyalty',
        body: 'Replace punch cards with QR-powered digital stamp cards customers can keep on their phones.',
        visual: LoyaltyCard,
    },
    {
        icon: Clock3,
        title: 'Fast counter flow',
        body: 'Staff can issue stamps and redeem perks in seconds, keeping queues short during busy hours.',
        visual: Quick,
    },
    {
        icon: BadgeDollarSign,
        title: 'Reward tracking',
        body: 'Every claim is recorded clearly so owners know which rewards are driving repeat visits.',
        visual: Track,
    },
    {
        icon: PieChart,
        title: 'Customer insights',
        body: 'See customers, stamps given, visits by day, and return frequency from the business dashboard.',
        visual: Insights,
    },
    {
        icon: Bell,
        title: 'Perk claim visibility',
        body: 'Keep pending and redeemed claims organized so no reward request gets lost.',
        visual: Organized,
    },
    {
        icon: Globe2,
        title: 'Mobile friendly',
        body: 'Customers can join, check stamps, and view rewards from any modern phone browser.',
        visual: Mobile,
    },
];

const articles = [
    {
        title: 'Your Loyalty Program Shouldn\'t Just Retain Customers — It Should Grow Their Business and Yours',
        date: 'September 17, 2025',
        read: '6 min read',
        url: 'https://www.entrepreneur.com/growing-a-business/the-best-loyalty-programs-grow-customer-businesses-not/496537',
        source: 'Entrepreneur',
    },
    {
        title: 'Reshaping Customer Loyalty Programs',
        date: 'March 20, 2026',
        read: '12 min read',
        url: 'https://www.deloitte.com/us/en/insights/industry/retail-distribution/reshaping-customer-loyalty-programs.html',
        source: 'Deloitte Insights',
    },
    {
        title: 'Benefits of Implementing a Customer Loyalty Program',
        date: 'January 20, 2026',
        read: '8 min read',
        url: 'https://rits.center/blog/benefits-of-implementing-a-customer-loyalty-program',
        source: 'RITS Center',
    },
    {
        title: '100+ Staggering Customer Loyalty Program Statistics for 2025',
        date: 'September 1, 2025',
        read: '10 min read',
        url: 'https://www.trueloyal.com/resources/loyalty-statistics/',
        source: 'True Loyal',
    },
    {
        title: 'Top Loyalty Trends for 2026: Driving Profit, Not Just Participation',
        date: 'September 22, 2025',
        read: '7 min read',
        url: 'https://www.retaildive.com/spons/top-loyalty-trends-for-2026-driving-profit-not-just-participation/809432/',
        source: 'Retail Dive',
    },
];

const heroProductCards = [
    {
        name: 'Free Coffee',
        stampsRequired: 5,
        description: 'Any size, any drink',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    },
    {
        name: '50% Off Pizza',
        stampsRequired: 8,
        description: 'Any regular or large',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    },
    {
        name: 'Free Dessert',
        stampsRequired: 10,
        description: 'Any item from dessert menu',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',
    },
    {
        name: 'Free Salad',
        stampsRequired: 6,
        description: 'Regular size, any dressing',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    },
    {
        name: 'Free Meal',
        stampsRequired: 12,
        description: 'Burger + fries + drink',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    },
    {
        name: '25% Off Smoothie',
        stampsRequired: 4,
        description: 'Any blended drink',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    },
    {
        name: 'Free Pastry',
        stampsRequired: 3,
        description: 'Croissant, muffin, or roll',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    },
    {
        name: 'VIP Birthday Treat',
        stampsRequired: 20,
        description: 'Free slice + loyalty badge',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
    },
];


const partnerBusinesses = [
    {
        name: 'Manila Cafe Bistro',
        address: 'Sampaloc, Manila',
        type: 'Café',
        lat: 14.6079,
        lng: 120.9881,
    },
    {
        name: 'Papakape Fort Santiago',
        address: 'Intramuros, Manila',
        type: 'Café',
        lat: 14.5947,
        lng: 120.9696,
    },
    {
        name: 'House of Lechon',
        address: 'Cebu City',
        type: 'Restaurant',
        lat: 10.3177,
        lng: 123.9017,
    },
    {
        name: 'Bell+Amadeus',
        address: 'Cebu City',
        type: 'Restaurant',
        lat: 10.3282,
        lng: 123.909,
    },
    {
        name: 'SVS Salon Prime',
        address: 'Davao City',
        type: 'Salon',
        lat: 7.0756,
        lng: 125.6116,
    },
    {
        name: "Masters' Classe Salon",
        address: 'Davao City',
        type: 'Salon',
        lat: 7.0991,
        lng: 125.6259,
    },
    {
        name: 'Victoria Bakery',
        address: 'Baguio City',
        type: 'Bakery',
        lat: 16.4144,
        lng: 120.5967,
    },
    {
        name: 'American Backyard',
        address: 'Iloilo City',
        type: 'Restaurant',
        lat: 10.7118,
        lng: 122.5512,
    },
    {
        name: 'Waterfront Seafood',
        address: 'Iloilo City',
        type: 'Restaurant',
        lat: 10.7013,
        lng: 122.5566,
    },
];


function HeroTransformCard({ item }: { item: (typeof heroLanes)[number] }) {
    return (
        <div
            className="hero-transform-card"
            style={
                {
                    '--card-top': `${item.top}px`,
                    '--card-width': `${item.size}px`,
                    '--card-delay': `${item.delay}s`,
                    '--card-duration': `${item.duration}s`,
                    '--card-tilt': `${item.tilt}deg`,
                    '--card-wave': `${item.wave}px`,
                } as React.CSSProperties
            }
        >
            <div className="hero-transform-card__inner">
                <div className="hero-transform-card__face hero-transform-card__face--skeleton">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-200" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                        <div className="h-2 w-20 rounded-full bg-slate-100" />
                    </div>
                    <div className="hidden min-w-0 flex-1 space-y-1.5 sm:block">
                        <div className="h-2.5 w-24 rounded-full bg-slate-100" />
                        <div className="h-2 w-14 rounded-full bg-slate-100" />
                    </div>
                    <div className="h-6 w-12 rounded-full bg-slate-100" />
                </div>
                <div className="hero-transform-card__face hero-transform-card__face--filled">
                    <img
                        src={item.card.image}
                        alt={item.card.name}
                        className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                            {item.card.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                            {item.card.description}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-amber-500">
                            {item.card.stampsRequired}
                        </p>
                        <span className="text-[9px] font-medium text-slate-400">
                            stamps
                        </span>
                    </div>
                </div>
            </div>
            <span
                className="hero-transform-card__spark"
                style={{
                    animationDelay: `${item.delay + item.duration * 0.49}s`,
                }}
                aria-hidden="true"
            />
        </div>
    );
}

const heroLanes = Array.from({ length: 16 }, (_, index) => ({
    card: heroProductCards[index % heroProductCards.length],
    delay: index * -0.58,
    duration: 13.5 + (index % 4) * 0.85,
    top: 66 + (index % 8) * 76,
    tilt: index % 2 === 0 ? -4 : 4,
    size: 250 + (index % 3) * 26,
    wave: ((index % 5) - 2) * 12,
}));



function Logo() {
    return (
        <a href="/" className="flex items-center gap-2 font-semibold">
            <img src={MainLogo} alt="StampBayan Logo" className='h-10' />
        </a>
    );
}

function ButtonLink({
    href,
    children,
    variant = 'primary',
    className = '',
    target = ''
}: {
    href: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
        className?: string;
    target?: string;
}) {
    const variants = {
        primary:
            'bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-blue-700',
        secondary:
            'border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:text-primary',
        ghost: 'text-slate-700 hover:text-primary',
    };

    return (
        <a
            href={href}
            target={target}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-300 ${variants[variant]} ${className}`}
        >
            {children}
        </a>
    );
}

function AuthMenu({
    type,
    variant,
}: {
    type: 'signIn' | 'signUp';
    variant: 'primary' | 'secondary';
}) {
    const [open, setOpen] = useState(false);
    const label = type === 'signIn' ? 'Sign in' : 'Create Account';

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-300 ${
                    variant === 'primary'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-blue-700'
                        : 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:text-primary'
                }`}
            >
                {label}
                <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {open && (
                <div className="absolute right-0 top-full z-50 w-52 pt-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/80">
                        {authChoices.map((choice) => (
                            <a
                                key={`${type}-${choice.label}`}
                                href={choice[type]}
                                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-primary"
                            >
                                {label} as {choice.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductCard({
    card,
    index,
}: {
    card: (typeof productCards)[number];
    index: number;
}) {
    const Icon = card.icon;

    return (
        <div
            className="animate-float-slow flex min-w-[245px] items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-xl shadow-slate-200/60 backdrop-blur"
            style={{
                animationDelay: `${index * 0.18}s`,
                transform: `rotate(${index % 2 === 0 ? -4 : 4}deg)`,
            }}
        >
            <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${card.tint}`}
            >
                <Icon className="h-6 w-6 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">
                    {card.name}
                </p>
                <p className="text-xs text-slate-500">{card.price}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-primary">
                    {card.revenue}
                </p>
                <p className="text-[10px] font-medium text-slate-400">Status</p>
            </div>
        </div>
    );
}

function ToolIcon({
    item,
    index,
}: {
    item: (typeof toolIcons)[number];
    index: number;
}) {
    const Icon = item.icon;

    return (
        <div className="group relative" title={item.label}>
            <div
                className={`animate-float-slow grid ${item.large ? 'h-16 w-16 -translate-y-3 rounded-3xl' : 'h-12 w-12 rounded-2xl'} place-items-center ${item.color} text-white shadow-xl shadow-slate-400/30 transition hover:-translate-y-2`}
                style={{ animationDelay: `${index * 0.12}s` }}
            >
                <Icon className={item.large ? 'h-8 w-8' : 'h-6 w-6'} />
            </div>
            <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100">
                {item.label}
            </span>
        </div>
    );
}

function DashboardMockup() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-blue-100/80">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-auto h-6 w-28 rounded-full bg-blue-50" />
            </div>
            <div className="bg-slate-50/70 p-3">
                <img
                    src={dashboardSnapshot}
                    alt="StampBayan business dashboard with sidebar navigation and analytics cards"
                    className="h-full max-h-[430px] w-full rounded-xl object-cover object-left-top"
                />
            </div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(
        null,
    );
    const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        const handler = (event: Event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleMobileDownload = async () => {
        const promptEvent = installPrompt as
            | (Event & {
                  prompt?: () => Promise<void>;
                  userChoice?: Promise<{ outcome: string }>;
              })
            | null;

        if (promptEvent?.prompt) {
            await promptEvent.prompt();
            await promptEvent.userChoice?.catch(() => null);
            setInstallPrompt(null);
            return;
        }

        const isIos =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        window.alert(
            isIos
                ? 'To install StampBayan: open this page in Safari, tap Share, then Add to Home Screen.'
                : 'To install StampBayan: open your browser menu and choose Install app or Add to Home screen.',
        );
    };

    const handleDashboardClick = () => {
        if (auth.customer) {
            router.visit('/customer/dashboard');
            return;
        }

        if (auth.user) {
            router.visit('/business/dashboard');
            return;
        }

        setDashboardDialogOpen(true);
    };

    const handleDashboardChoice = (type: 'business' | 'customer') => {
        setDashboardDialogOpen(false);
        router.visit(type === 'customer' ? '/customer/login' : '/login');
    };

    return (
        <>
            {/* SEO HEAD TAGS - THIS IS THE MOST IMPORTANT PART */}
            <Head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="96x96"
                    href="/favicon-96x96.png"
                />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />

                <title>
                    StampBayan - Free Digital Loyalty Card System for Philippine
                    Businesses
                </title>
                <meta
                    name="title"
                    content="StampBayan - Free Digital Loyalty Card System"
                />
                <meta
                    name="description"
                    content="FREE digital loyalty card system for Philippine businesses. Replace paper punch cards with QR scanning, track customers, issue stamps, and manage rewards."
                />
                <meta
                    name="keywords"
                    content="free loyalty program Philippines, customer loyalty card, digital stamp card, QR loyalty system, Filipino business tools"
                />
                <link rel="canonical" href="https://www.stampbayan.com" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.stampbayan.com" />
                <meta
                    property="og:title"
                    content="StampBayan - Free Digital Loyalty Card System"
                />
                <meta
                    property="og:description"
                    content="StampBayan helps Philippine businesses replace punch cards with QR-based digital loyalty cards. Track stamps, customers, perks, and repeat visits from one dashboard."
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="StampBayan - Free Digital Loyalty Card System"
                />
                <meta
                    name="twitter:description"
                    content="A free QR loyalty card platform for Philippine businesses."
                />
            </Head>

            <main className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950">
                <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100/70 bg-white/90 shadow-sm shadow-slate-200/30 backdrop-blur-xl">
                    <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                        <Logo />

                        <div className="hidden items-center gap-9 lg:flex">
                            {navItems.map((item) => (
                                <div key={item.label} className="group relative">
                                    <a
                                        href={item.href ?? '#'}
                                        className="flex items-center gap-1 py-7 text-sm font-medium text-slate-700 transition hover:text-primary"
                                    >
                                        {item.label}
                                        {item.hasDropdown && (
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                    </a>
                                    {item.hasDropdown && (
                                        <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100">
                                            <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/80">
                                                {navDropdownLinks[item.label].map((link) => (
                                                    <a
                                                        key={link.label}
                                                        href={link.href}
                                                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-primary"
                                                    >
                                                        {link.label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="hidden items-center gap-3 lg:flex">
                            <AuthMenu type="signIn" variant="secondary" />
                            <AuthMenu type="signUp" variant="primary" />
                        </div>

                        <button
                            type="button"
                            aria-label="Toggle navigation"
                            onClick={() => {
                                setMobileOpen((open) => !open);
                                setMobileDropdownOpen(null);
                            }}
                            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden"
                        >
                            {mobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </nav>

                    {mobileOpen && (
                        <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-xl lg:hidden">
                            <div className="mx-auto flex max-w-7xl flex-col gap-4">
                                {navItems.map((item) =>
                                    item.hasDropdown ? (
                                        <div key={item.label}>
                                            <button
                                                type="button"
                                                aria-expanded={
                                                    mobileDropdownOpen ===
                                                    item.label
                                                }
                                                onClick={() =>
                                                    setMobileDropdownOpen(
                                                        (open) =>
                                                            open === item.label
                                                                ? null
                                                                : item.label,
                                                    )
                                                }
                                                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-semibold text-slate-700"
                                            >
                                                {item.label}
                                                <ChevronDown
                                                    className={`h-4 w-4 transition ${
                                                        mobileDropdownOpen ===
                                                        item.label
                                                            ? 'rotate-180'
                                                            : ''
                                                    }`}
                                                />
                                            </button>

                                            {mobileDropdownOpen ===
                                                item.label && (
                                                <div className="mt-2 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                                                    {navDropdownLinks[
                                                        item.label
                                                    ].map((link) => (
                                                        <a
                                                            key={link.label}
                                                            href={link.href}
                                                            onClick={() =>
                                                                setMobileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-primary"
                                                        >
                                                            {link.label}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                            className="flex items-center justify-between rounded-xl px-2 py-2 text-sm font-semibold text-slate-700"
                                        >
                                            {item.label}
                                        </a>
                                    ),
                                )}
                                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                                    {authChoices.map((choice) => (
                                        <div
                                            key={choice.label}
                                            className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                                        >
                                            <p className="mb-2 text-xs font-bold text-slate-500 uppercase">
                                                {choice.label}
                                            </p>
                                            <div className="grid gap-2">
                                                <ButtonLink
                                                    href={choice.signIn}
                                                    variant="secondary"
                                                    className="w-full py-2.5"
                                                >
                                                    Sign in
                                                </ButtonLink>
                                                <ButtonLink
                                                    href={choice.signUp}
                                                    className="w-full py-2.5"
                                                >
                                                    Sign up
                                                </ButtonLink>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleMobileDownload}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-blue-700 sm:hidden"
                                >
                                    <Download className="h-4 w-4" />
                                    Download App
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                <Dialog
                    open={dashboardDialogOpen}
                    onOpenChange={setDashboardDialogOpen}
                >
                    <DialogContent className="rounded-3xl border-slate-100 p-6 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold text-slate-950">
                                Open your dashboard
                            </DialogTitle>
                            <DialogDescription className="text-center text-slate-500">
                                Choose the account type you want to continue
                                with.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => handleDashboardChoice('business')}
                                className="group rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-950">
                                            Business Login
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Manage cards, stamps, rewards, and
                                            customers.
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-primary" />
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDashboardChoice('customer')}
                                className="group rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-950">
                                            Customer Login
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            View stamps, rewards, and loyalty
                                            progress.
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-primary" />
                                </div>
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                <section className="relative pt-32 pb-12 sm:pt-36 lg:pt-40">
                    <div className="mx-auto max-w-4xl px-5 text-center">
                        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Free digital loyalty cards are live!
                        </div>
                        <h1 className="mx-auto max-w-2xl text-4xl leading-[1.04] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Loyalty that keeps{' '}
                            <span className="text-primary">customers</span>
                            <br /> coming{' '}
                            <span className="text-primary">back</span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-800 sm:text-[16px]">
                            Give customers a reason to come back with QR stamp
                            cards, instant rewards, staff tools, and loyalty
                            analytics built for local businesses.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleDashboardClick}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-primary"
                            >
                                <BarChart3 className="h-4 w-4 text-primary" />
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </section>

                <section className="relative mt-0 bg-gradient-to-b from-white via-blue-50 to-white pt-16 pb-16 sm:-mt-10 sm:pt-10 sm:pb-24">
                    <div className="hero-stage pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
                        <div
                            className="hero-transform-field"
                            aria-hidden="true"
                        >
                            {heroLanes.map((item) => (
                                <HeroTransformCard
                                    key={`${item.card.name}-${item.delay}`}
                                    item={item}
                                />
                            ))}
                        </div>

                        <svg
                            viewBox="0 0 1440 900"
                            xmlns="http://www.w3.org/2000/svg"
                            className="hero-mountain absolute bottom-0 left-1/2 -translate-x-1/2"
                            aria-hidden="true"
                        >
                            <defs>
                                <linearGradient
                                    id="stampbayan-mountain"
                                    x1="720"
                                    x2="720"
                                    y1="0"
                                    y2="900"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop
                                        offset="0"
                                        stopColor="#f4b942"
                                        stopOpacity="0"
                                    />
                                    <stop
                                        offset="0.3"
                                        stopColor="#f4b942"
                                        stopOpacity="1"
                                    />
                                    <stop
                                        offset="0.7"
                                        stopColor="#f4b942"
                                        stopOpacity="1"
                                    />
                                    <stop
                                        offset="1"
                                        stopColor="#f4b942"
                                        stopOpacity="0"
                                    />
                                </linearGradient>
                            </defs>
                            <path
                                d="M712 0 L712 150 C712 600 550 680 -200 750 L-200 900 L1640 900 L1640 750 C890 680 728 600 728 150 L728 0 Z"
                                fill="url(#stampbayan-mountain)"
                                stroke="none"
                            />
                        </svg>

                        <div
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{ top: '180px' }}
                        >
                            <img
                                src={MainLogo}
                                alt="StampBayan Logo"
                                className="h-14 w-36"
                            />
                        </div>
                    </div>

                    <div className="relative mx-auto mt-56 max-w-7xl px-5 pt-52 text-center text-white sm:mt-72 sm:pt-64 lg:mt-85 lg:pt-72">
                        <h2 className="text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
                            StampBayan platform
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-blue-50">
                            Everything a local business needs to run QR stamp
                            cards, manage rewards, support staff, and understand
                            customer visits.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                            {toolIcons.map((item, index) => (
                                <ToolIcon
                                    key={`${item.color}-${index}`}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>
                        <div
                            id="dashboard"
                            className="mt-10 rounded-2xl border border-white/60 bg-white p-4 text-left text-slate-950 shadow-2xl shadow-blue-200/80 sm:rounded-3xl sm:p-5 lg:mt-12 lg:p-10"
                        >
                            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                                <div className="self-center">
                                    <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-red-500 text-white">
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                    <div className="mb-4 flex items-center gap-2">
                                        <h3 className="text-xl font-bold">
                                            Business Dashboard
                                        </h3>
                                        <span className="rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500">
                                            LIVE
                                        </span>
                                    </div>
                                    <p className="text-sm leading-6 text-slate-600">
                                        Monitor total customers, new signups,
                                        stamps given, traffic by day, and visit
                                        frequency from a clean dashboard with
                                        sidebar navigation for every tool.
                                    </p>
                                    <ButtonLink
                                        href="/login"
                                        className="mt-5 px-4 py-2.5"
                                    >
                                        Open dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </ButtonLink>
                                </div>
                                <DashboardMockup />
                            </div>
                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {[
                                    'Track customer activity',
                                    'Issue stamps faster',
                                    'Manage rewards clearly',
                                ].map((title) => (
                                    <div key={title}>
                                        <h4 className="font-semibold">
                                            {title}
                                        </h4>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Keep daily operations, customer
                                            progress, and reward redemptions in
                                            one calm workspace.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="business-map"
                    className="relative overflow-hidden px-5 py-16 sm:py-20 lg:py-24"
                >
                    <svg
                        viewBox="0 0 1440 900"
                        xmlns="http://www.w3.org/2000/svg"
                        className="hero-mountain absolute top-0 left-1/2 -translate-x-1/2 rotate-180"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="stampbayan-mountain"
                                x1="720"
                                x2="720"
                                y1="0"
                                y2="900"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop
                                    offset="0"
                                    stopColor="#f4b942"
                                    stopOpacity="0"
                                />
                                <stop
                                    offset="0.3"
                                    stopColor="#f4b942"
                                    stopOpacity="1"
                                />
                                <stop
                                    offset="0.7"
                                    stopColor="#f4b942"
                                    stopOpacity="1"
                                />
                                <stop
                                    offset="1"
                                    stopColor="#f4b942"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>
                        <path
                            d="M712 0 L712 150 C712 600 550 680 -200 750 L-200 900 L1640 900 L1640 750 C890 680 728 600 728 150 L728 0 Z"
                            fill="url(#stampbayan-mountain)"
                            stroke="none"
                        />
                    </svg>
                    <div className="absolute inset-x-0 top-8 mx-auto h-72 max-w-5xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.24),transparent_68%)] blur-3xl sm:h-[520px]" />
                    <div className="relative mx-auto max-w-3xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Growing across the Philippines
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90">
                            See where local businesses are using StampBayan to
                            ditch paper cards, reward loyal customers, and drive
                            repeat visits.
                        </p>
                    </div>

                    <div className="relative mx-auto mt-12 w-full max-w-lg sm:mt-20">
                        <StampBayanMap />
                    </div>
                </section>

                {/* <section className="relative px-5 py-24">
                    <div className="absolute inset-x-0 top-8 mx-auto h-[520px] max-w-5xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.24),transparent_68%)] blur-3xl" />
                    <div className="relative mx-auto max-w-3xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-5xl">
                            QR scanning made simple
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
                            Staff can scan, issue, and validate stamps in a few
                            taps while customers keep their loyalty progress on
                            their phones.
                        </p>
                        <ButtonLink
                            href="/documentation"
                            target="_blank"
                            className="mt-7 px-5 py-2.5"
                        >
                            Learn More
                        </ButtonLink>

                        <div className="mx-auto mt-12 max-w-2xl space-y-5 text-left">
                            {[
                                'Scan a customer QR code at the counter',
                                'Issue one stamp after a completed purchase',
                                'Redeem a free drink reward when the card is full',
                                "Review today's busiest visit hours",
                            ].map((prompt, index) => (
                                <div
                                    key={prompt}
                                    className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm transition ${index === 2 ? 'border border-blue-200 bg-white text-primary shadow-xl shadow-blue-100' : 'text-slate-400'}`}
                                >
                                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">
                                        {index === 2 ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </span>
                                    <span className="flex-1">{prompt}</span>
                                    {index === 2 && (
                                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
                                            <Send className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section> */}

                <section
                    id="latest-articles"
                    className="mx-auto max-w-6xl px-5 py-16 sm:py-20"
                >
                    <div className="mb-10">
                        <div className="mb-4 inline-flex max-w-full flex-wrap rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold">
                            StampBayan is ready for your shop
                            <span className="ml-2 text-primary">
                                Check what&apos;s new
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Perks of StampBayan
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                            Built for Philippine businesses that want a cleaner,
                            faster way to reward loyal customers.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {perks.map((perk) => {
                            const Icon = perk.icon;
                            const Visual = perk.visual;
                            return (
                                <article
                                    key={perk.title}
                                    className="rounded-2xl bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 sm:rounded-3xl sm:p-7"
                                >
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
                                            <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <h3 className="font-bold">
                                            {perk.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm leading-6 text-slate-600 md:min-h-20">
                                        {perk.body}
                                    </p>
                                    <div className="mt-6 grid h-36 place-items-center rounded-2xl bg-gradient-to-b from-white to-blue-50 sm:mt-8 sm:h-44 sm:rounded-3xl">
                                        <img
                                            src={Visual}
                                            alt=""
                                            className="h-20 w-20 text-blue-500 opacity-80 sm:h-24 sm:w-24"
                                        />
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section
                    id="mobile-app"
                    className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-16 text-center sm:py-24"
                >
                    <div className="absolute inset-x-0 top-0 h-28 rounded-b-[50%] bg-white" />
                    <div className="relative mx-auto max-w-3xl">
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold">
                            894+ Customers are using StampBayan
                        </span>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
                            Mobile-ready customer experience
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
                            Customers can open their stamp card from their
                            phone, check progress, and see available rewards
                            without downloading a native app.
                        </p>
                        <ButtonLink href="#" className="mt-7">
                            View customer portal
                            <ArrowRight className="h-4 w-4" />
                        </ButtonLink>
                        <div className="mx-auto mt-10 grid w-full max-w-xs place-items-center rounded-[2rem] shadow-2xl shadow-blue-200 sm:mt-14 sm:max-w-md">
                            <img
                                src={Phone}
                                alt="StampBayan customer mobile portal showing a digital stamp card with 5 out of 10 stamps collected and a free drink reward available for redemption."
                                className="h-64 w-auto sm:h-80"
                            />
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
                    <div className="mb-8 inline-flex max-w-full flex-wrap gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold sm:gap-3">
                        <span>5/5 Rating</span>
                        <span className="text-primary">894+ active users</span>
                    </div>
                    <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
                        Browse our latest articles
                    </h2>
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
                        <a
                            href={articles[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl bg-slate-100 p-4 transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-5"
                        >
                            <div
                                style={{ backgroundImage: `url(${Article})` }}
                                className="grid min-h-56 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 bg-cover bg-center text-white sm:h-72"
                            >
                                <div className="bg-blue-600/95 px-5 py-4 text-center sm:px-8 sm:py-5">
                                    <p className="text-lg font-bold sm:text-2xl">
                                        {articles[0].title}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-6 text-xs text-slate-500">
                                {articles[0].date} • {articles[0].read}
                            </p>
                            <h3 className="mt-3 text-lg font-bold sm:text-xl">
                                {articles[0].title}
                            </h3>
                            <p className="mt-4 text-sm text-slate-600">
                                Learn how QR loyalty cards make repeat visits
                                easier for customers and staff.
                            </p>
                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                Read Article <ArrowRight className="h-4 w-4" />
                            </span>
                        </a>

                        <div className="space-y-6 sm:space-y-8">
                            {articles.slice(1).map((article) => (
                                <a
                                    key={article.url}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition hover:opacity-80"
                                >
                                    <p className="text-xs text-slate-500">
                                        {article.date} • {article.read}
                                    </p>
                                    <h3 className="mt-2 text-base font-bold sm:text-lg">
                                        {article.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Learn how to improve customer retention,
                                        speed up counter workflows, and reward
                                        loyal visitors more consistently.
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="overflow-hidden px-5 pt-12 pb-6 text-center sm:pt-15 sm:pb-8 lg:pb-10">
                    <div className="mx-auto mb-8 grid max-w-sm grid-cols-5 justify-items-center gap-3 sm:mb-10 sm:flex sm:h-20 sm:max-w-3xl sm:items-end sm:justify-center">
                        {toolIcons.map((item, index) => {
                            const total = toolIcons.length;
                            const mid = (total - 1) / 2;
                            const distanceFromCenter = Math.abs(index - mid);

                            const translateY =
                                Math.pow(distanceFromCenter, 2) * 1.8;

                            return (
                                <div
                                    key={`launch-${item.color}-${index}`}
                                    className="sm:[transform:var(--launch-offset)]"
                                    style={
                                        {
                                            '--launch-offset': `translateY(${translateY}px)`,
                                        } as React.CSSProperties
                                    }
                                >
                                    <ToolIcon item={item} index={index} />
                                </div>
                            );
                        })}
                    </div>

                    {/* 2. Clean, unwarped, professional typography */}
                    <div className="relative z-10 mx-auto max-w-3xl">
                        <h2 className="text-2xl leading-[1.15] font-normal tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                            Launch your digital <br className="sm:hidden" />{' '}
                            loyalty program today
                        </h2>

                        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                            Create stamp cards, invite customers, issue rewards,
                            and <br className="hidden md:inline" />
                            track loyalty activity from one modern system.
                        </p>
                    </div>
                </section>

                <footer className="relative -mt-6 overflow-hidden bg-white px-5 pt-40 pb-10 text-white sm:-mt-8 sm:pt-48 lg:-mt-10 lg:pt-56">
                    <svg
                        viewBox="0 0 1440 900"
                        xmlns="http://www.w3.org/2000/svg"
                        className="footer-wave absolute top-0 left-1/2 h-80 -translate-x-1/2 sm:h-96 lg:h-[28rem]"
                        aria-hidden="true"
                    >
                        <path
                            d="M 0 600 Q 720 100 1440 600 L 1440 900 L 0 900 Z"
                            className="fill-blue-600"
                            stroke="none"
                        />
                    </svg>
                    <div className="absolute inset-x-0 top-44 bottom-0 bg-blue-600 sm:top-52 lg:top-60" />
                    <div className="relative mx-auto max-w-6xl">
                        <div className="text-center">
                            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white/20 text-white sm:h-24 sm:w-24 sm:rounded-[2rem]">
                                <Box className="h-10 w-10 sm:h-14 sm:w-14" />
                            </div>
                            <h2 className="text-3xl font-semibold sm:text-5xl">
                                Ready to begin?
                            </h2>
                            <p className="mt-3 text-sm text-blue-50">
                                Create your free account and start rewarding
                                repeat customers today.
                            </p>
                            <ButtonLink
                                href="/register"
                                variant="secondary"
                                className="mt-6"
                            >
                                Create Account{' '}
                                <ArrowRight className="h-4 w-4" />
                            </ButtonLink>
                        </div>

                        <div className="mt-14 grid gap-8 border-b border-white/20 pb-10 sm:mt-20 sm:grid-cols-2 md:grid-cols-5 md:gap-10">
                            <div className="md:col-span-2">
                                <Logo />
                                <p className="mt-5 max-w-xs text-sm leading-6 text-blue-50">
                                    Replace paper punch cards with QR scanning,
                                    customer dashboards, and simple reward
                                    management.
                                </p>
                            </div>
                            {footerLinks.map((group) => (
                                <div key={group.title}>
                                    <h3 className="font-semibold">
                                        {group.title}
                                    </h3>
                                    <div className="mt-4 space-y-3">
                                        {group.links.map((link) => (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                className="block text-sm text-blue-50 transition hover:text-white"
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col items-center justify-between gap-5 text-center text-sm text-blue-50 md:flex-row md:text-left">
                            <p>
                                Copyright 2026 StampBayan. All Rights Reserved.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-5">
                                <Instagram className="h-4 w-4" />
                                <Youtube className="h-4 w-4" />
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms</a>
                            </div>
                        </div>
                    </div>
                </footer>

            </main>
        </>
    );
}
