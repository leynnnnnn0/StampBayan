import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BarChart3,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    Download,
    Facebook,
    Globe,
    Headphones,
    Instagram,
    Mail,
    Palette,
    Phone,
    QrCode,
    QrCodeIcon,
    Send,
    Smartphone,
    Sparkles,
    Star,
    TrendingUp,
    User2,
    Users,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import homeBackground from '../../images/homeBackground.png';
import LOGO from '../../images/mainLogo.png';

export default function Welcome() {
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Detect Android
        const android = /Android/.test(navigator.userAgent);
        setIsAndroid(android);

        // Listen for beforeinstallprompt (Android Chrome)
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    useEffect(() => {
        // Check if user just installed and redirect accordingly
        const userType = localStorage.getItem('stampbayan_user_type');
        if (
            userType &&
            window.matchMedia('(display-mode: standalone)').matches
        ) {
            const route =
                userType === 'customer' ? '/customer/login' : '/login';
            router.get(route);
            localStorage.removeItem('stampbayan_user_type'); // Clear after redirect
        }
    }, []);

    const handleDownloadApp = (type) => {
        localStorage.setItem('stampbayan_user_type', type);

        if (isAndroid) {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        toast.success('Installing StampBayan...');
                    }
                    setDeferredPrompt(null);
                    setDownloadDialogOpen(false);
                });
            } else {
                // Android but prompt not ready
                toast.info(
                    "To install: Click the 3 dots (⋮) in Chrome and select 'Install app'",
                );
            }
        } else if (isIOS) {
            toast.info('Please follow the steps below to install on iOS.');
        }
    };

    const steps = [
        {
            icon: <User2 className="h-8 w-8 text-white" />,
            title: 'Create Business Account',
            desc: 'Sign up in seconds and set up your business profile. Customize your loyalty program with your brand colors and rewards.',
        },
        {
            icon: <QrCodeIcon className="h-8 w-8 text-white" />,
            title: 'Print Your QR Code',
            desc: 'Generate and print your unique QR code. Display it at your counter, entrance, or anywhere customers can easily scan it.',
        },
        {
            icon: <Camera className="h-8 w-8 text-white" />,
            title: 'Customers Scan & Join',
            desc: 'Customers scan the QR code, register, and instantly join your loyalty program. No paper cards, no hassle!',
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.querySelector('main');
            if (heroSection) {
                const heroBottom =
                    heroSection.offsetTop + heroSection.offsetHeight;
                setIsScrolled(window.scrollY > heroBottom - 100);
            }

            const sections = [
                'benefits',
                'features',
                'how-it-works',
                'pricing',
                'faq',
            ];
            const scrollPosition = window.scrollY + 150;

            for (const sectionId of sections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;

                    if (
                        scrollPosition >= sectionTop &&
                        scrollPosition < sectionBottom
                    ) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.querySelector(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    const handleLoginChoice = (type: string) => {
        let route = '/login';
        setLoginDialogOpen(false);
        if (type == 'customer') {
            route = '/customer/login';
        }
        if (isDemo) {
            router.get(route, {
                data: {
                    is_demo: true,
                },
            });
        } else {
            router.get(route);
        }
    };

    useEffect(() => {
        if (!loginDialogOpen) {
            setIsDemo(false);
        }
    }, [loginDialogOpen]);

    const handleDemoClick = () => {
        setIsDemo(true);
        setLoginDialogOpen(true);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        email: '',
        suggestion: '',
    });

    const handleSubmit = () => {
        if (!data.suggestion.trim()) return;

        post('/suggestions', {
            onSuccess: () => {
                setSubmitSuccess(true);

                toast.success('Thank you for your feedback!');

                // Reset form and close modal after 2 seconds
                setTimeout(() => {
                    reset();
                    setSubmitSuccess(false);
                    setIsOpen(false);
                }, 3000);
            },
            onError: (errors) => {
                console.error('Submission error:', errors);
            },
        });
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
                    content="FREE digital loyalty card system for Philippine businesses. Replace punch cards with QR scanning. No fees, unlimited customers. Start in 5 minutes."
                />
                <meta
                    name="keywords"
                    content="free loyalty program Philippines, customer loyalty card, digital stamp card, Filipino business tools"
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
                    content="StampBayan is a FREE digital loyalty card system for Philippine businesses. Replace paper punch cards with QR code scanning. Track customer analytics, boost repeat sales, and build lasting relationships. No setup fees, unlimited customers. Start in 5 minutes."
                />
                <meta
                    property="og:image"
                    content="https://www.stampbayan.com/images/og-image.jpg"
                />
                <meta property="og:site_name" content="StampBayan" />
                <meta property="og:locale" content="en_PH" />
                <meta name="robots" content="index, follow" />
                <meta name="apple-mobile-web-app-title" content="StampBayan" />
                <meta name="application-name" content="StampBayan" />

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'StampBayan',
                        applicationCategory: 'BusinessApplication',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'PHP',
                        },
                        description:
                            'Free digital loyalty card system for Philippine businesses. Create, manage and track customer loyalty programs with QR code scanning.',
                        operatingSystem: 'Web-based',
                        countryOfOrigin: 'PH',
                    })}
                </script>
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-transparent">
                {/* Header */}
                <header
                    className={`fixed top-0 right-0 left-0 z-50 px-4 py-4 transition-all duration-300 sm:px-6 lg:px-8 lg:py-6 xl:px-12 ${
                        isScrolled ? 'bg-primary shadow-lg' : 'bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex flex-shrink-0 items-center gap-2">
                            <img
                                src={LOGO}
                                alt="StampBayan Logo"
                                className="h-8 w-24 sm:h-10 sm:w-32"
                            />
                        </div>

                        <nav
                            className={`hidden items-center gap-4 transition-all duration-300 lg:flex xl:gap-8 ${
                                isScrolled
                                    ? 'translate-y-0 opacity-100'
                                    : 'pointer-events-none -translate-y-4 opacity-0'
                            }`}
                        >
                            <a
                                href="#benefits"
                                onClick={(e) => scrollToSection(e, '#benefits')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'benefits' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                BENEFITS
                                {activeSection === 'benefits' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                            <a
                                href="#features"
                                onClick={(e) => scrollToSection(e, '#features')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'features' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                FEATURES
                                {activeSection === 'features' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>

                            <a
                                href="#how-it-works"
                                onClick={(e) =>
                                    scrollToSection(e, '#how-it-works')
                                }
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'how-it-works' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                HOW IT WORKS
                                {activeSection === 'how-it-works' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                            <a
                                href="#pricing"
                                onClick={(e) => scrollToSection(e, '#pricing')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'pricing' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                PRICING
                                {activeSection === 'pricing' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                            {/* PRICING LINK REMOVED */}
                            <a
                                href="#faq"
                                onClick={(e) => scrollToSection(e, '#faq')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'faq' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                FAQ
                                {activeSection === 'faq' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Dialog
                                open={loginDialogOpen}
                                onOpenChange={setLoginDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <button className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-medium text-primary transition hover:bg-white/30 sm:px-8 sm:text-sm">
                                        Login
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="mb-2 text-center text-2xl font-bold">
                                            Welcome Back!
                                        </DialogTitle>
                                        <DialogDescription className="text-center">
                                            Choose your account type to continue
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <button
                                            onClick={() =>
                                                handleLoginChoice('business')
                                            }
                                            className="group relative rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-500">
                                                    <svg
                                                        className="h-6 w-6 text-blue-600 transition-colors group-hover:text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Business Login
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Access your business
                                                        dashboard
                                                    </p>
                                                </div>
                                                <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400 transition-colors group-hover:text-blue-500" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleLoginChoice('customer')
                                            }
                                            className="group relative rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:border-green-500 hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-500">
                                                    <svg
                                                        className="h-6 w-6 text-green-600 transition-colors group-hover:text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Customer Login
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        View your loyalty
                                                        rewards
                                                    </p>
                                                </div>
                                                <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400 transition-colors group-hover:text-green-500" />
                                            </div>
                                        </button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 px-4 py-8 sm:px-4 sm:py-12 lg:py-16 xl:py-20">
                    {/* Background with gradient overlay */}
                    <div className="absolute inset-0 -z-10">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url(${homeBackground})`,
                            }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/70"></div>
                    </div>

                    <div className="mt-15 sm:mx-auto sm:max-w-7xl lg:mt-10">
                        <div className="sm:mx-auto sm:max-w-7xl">
                            <div className="mx-auto text-center leading-0 sm:max-w-5xl">
                                <h1 className="mb-2 px-4 text-2xl leading-tight font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                                    Stop Losing Customers to Competitors
                                </h1>

                                <p className="mx-auto mb-8 max-w-3xl px-4 text-xs text-white/80 sm:mb-12 sm:text-base lg:text-lg">
                                    Turn one-time buyers into loyal regulars
                                    with a digital loyalty program that actually
                                    works. No more lost punch cards. No more
                                    forgotten rewards.
                                </p>

                                {/* UPDATED: Free Forever Messages */}
                                <div className="mx-auto mb-8 flex flex-wrap justify-center gap-4 text-white/90 sm:mb-10 sm:gap-8">
                                    <p className="flex flex-col text-xs sm:text-base">
                                        <strong>✓ 100% Free</strong>
                                        <span className="text-[10px] sm:text-xs">
                                            Grow your business at zero cost
                                        </span>
                                    </p>
                                    <p className="flex flex-col text-xs sm:text-base">
                                        <strong>✓ Set up in 5 minutes</strong>
                                        <span className="text-[10px] sm:text-xs">
                                            Print QR code, start today
                                        </span>
                                    </p>
                                    <p className="flex flex-col text-xs sm:text-base">
                                        <strong>✓ Unlimited Access</strong>
                                        <span className="text-[10px] sm:text-xs">
                                            No subscription fees
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={() => setLoginDialogOpen(true)}
                                    className="cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-semibold text-primary shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-10 sm:py-4 sm:text-lg md:text-base lg:px-12"
                                >
                                    <div className="flex flex-col items-center justify-between">
                                        Create Free Account
                                        <span className="text-[8px] sm:text-xs">
                                            No Credit Card Required
                                        </span>
                                    </div>
                                </button>

                                <div className="mt-6 text-xs text-white sm:text-sm">
                                    ✓ No hidden fees • ✓ No setup fees • ✓ 24/7
                                    support
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Stats Section */}
                <section
                    id="benefits"
                    className="bg-gray/10 relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:py-16"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center sm:mb-16">
                            <h2 className="mb-4 text-lg font-bold sm:mb-6 sm:text-4xl lg:text-3xl">
                                Why Loyalty Programs Work
                            </h2>
                            <p className="mx-auto -mt-2 max-w-3xl px-4 text-xs text-black/80 sm:text-lg lg:text-lg">
                                The numbers speak for themselves
                            </p>
                        </div>
                        <div className="-mt-5 grid gap-6 md:grid-cols-3 lg:gap-8">
                            <div className="rounded-2xl border border-primary bg-white/10 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/20">
                                        <TrendingUp className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-black">
                                            67%
                                        </div>
                                        <div className="text-sm text-black/70">
                                            More spending from loyal customers
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60">
                                    <a
                                        href="https://emarsys.com/learn/blog/increase-customer-loyalty-retention/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-green-600 underline decoration-green-400 hover:text-green-700"
                                    >
                                        Studies
                                    </a>{' '}
                                    show loyal customers spend significantly
                                    more than new ones
                                </p>
                            </div>

                            <div className="rounded-2xl border border-primary bg-white/10 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="bg-white-400/20 flex h-12 w-12 items-center justify-center rounded-xl">
                                        <Users className="text-white-400 h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-black">
                                            5x
                                        </div>
                                        <div className="text-sm text-black/70">
                                            More likely to return
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60">
                                    Customers with{' '}
                                    <a
                                        href="https://www.businessdasher.com/customer-loyalty-statistics/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-black-600 decoration-black-400 font-semibold underline hover:text-blue-700"
                                    >
                                        loyalty cards
                                    </a>{' '}
                                    visit 5 times more often
                                </p>
                            </div>

                            <div className="rounded-2xl border border-primary bg-white/10 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/20">
                                        <BarChart3 className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-black">
                                            25-95%
                                        </div>
                                        <div className="text-sm text-black/70">
                                            Profit increase potential
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60">
                                    Just{' '}
                                    <a
                                        href="https://www.bain.com/insights/retaining-customers-is-the-real-challenge/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-yellow-600 underline decoration-yellow-400 hover:text-yellow-700"
                                    >
                                        5% increase in retention
                                    </a>{' '}
                                    can boost profits dramatically
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="relative z-10 bg-primary/10 px-4 py-12 sm:px-6 sm:py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl">
                        {/* Header Section */}
                        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <span className="text-sm font-bold tracking-wider text-primary uppercase">
                                    Why Choose Us?
                                </span>
                                <h2 className="mt-2 text-3xl font-bold text-[#333333] sm:text-5xl">
                                    Powerful Features for Your{' '}
                                    <span className="text-primary">
                                        Business
                                    </span>
                                </h2>
                            </div>
                            <p className="max-w-md text-base text-gray-500 md:text-right">
                                Everything you need to run a successful loyalty
                                program without the bloat.
                            </p>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* 1. Customer Analytics (Large Red Card) */}
                            <article className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-primary p-6 text-white sm:p-8 md:col-span-2 lg:col-span-1 lg:row-span-2">
                                <div>
                                    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-4 text-2xl leading-tight font-bold sm:text-3xl">
                                        Customer Analytics
                                    </h3>
                                    <p className="text-base opacity-90 sm:text-lg">
                                        Track customer traffic by day, visit
                                        frequency, and new customer counts to
                                        make data-driven decisions and plan
                                        better.
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-sm font-semibold sm:mt-12">
                                    <Check className="h-4 w-4" /> Real-time data
                                    visualization
                                </div>
                            </article>

                            {/* 2. Customizable Cards */}
                            <article className="rounded-[32px] border-2 border-gray-100 bg-white p-6 transition-all hover:shadow-xl sm:p-8">
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F4B942]">
                                    <Palette className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#333333]">
                                    Customizable Cards
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Design loyalty cards that match your brand
                                    with custom colors, logos, and reward
                                    structures.
                                </p>
                            </article>

                            {/* 3. Scan to Stamp */}
                            <article className="rounded-[32px] border-2 border-gray-100 bg-white p-6 transition-all hover:shadow-xl sm:p-8">
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500">
                                    <Wifi className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#333333]">
                                    Scan to Stamp
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Customers can instantly earn stamps by
                                    scanning your QR code with their smartphone.
                                </p>
                            </article>

                            {/* 4. Custom QR Codes */}
                            <article className="rounded-[32px] border-2 border-gray-100 bg-white p-6 transition-all hover:shadow-xl sm:p-8">
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                    <QrCode className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#333333]">
                                    Custom QR Codes
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Generate unique QR codes for your business
                                    to display at your location for easy
                                    scanning.
                                </p>
                            </article>

                            {/* 5. 24/7 Customer Support */}
                            <article className="rounded-[32px] border-2 border-gray-100 bg-white p-6 transition-all hover:shadow-xl sm:p-8">
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                                    <Headphones className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#333333]">
                                    24/7 Support
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Get help anytime with our ticket-based
                                    support system. We're always here to assist.
                                </p>
                            </article>

                            {/* 6. Offline Stamp Codes (Wide Card) */}
                            <article className="flex flex-col justify-between overflow-hidden rounded-[32px] border-2 border-gray-100 bg-white p-6 sm:p-8 md:col-span-2">
                                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                                    <div>
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                            <WifiOff className="h-5 w-5" />
                                        </div>
                                        <h3 className="mb-2 text-2xl font-bold text-black">
                                            Offline Stamp Codes
                                        </h3>
                                        <p className="max-w-md text-sm text-gray-500">
                                            Award stamps even without internet
                                            connection using unique offline
                                            codes. Look more professional, no
                                            extra cost.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-gray-800 sm:flex-none">
                                            Generate
                                        </button>
                                        <button className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-gray-50 sm:flex-none">
                                            Print
                                        </button>
                                    </div>
                                </div>
                            </article>

                            {/* 7. Downloadable App */}
                            <article className="rounded-[32px] border-2 border-gray-100 bg-white p-6 transition-all hover:shadow-xl sm:p-8 md:col-span-2 lg:col-span-1">
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#333333]">
                                    Downloadable App
                                </h3>
                                <p className="mb-4 text-sm text-gray-500">
                                    A dedicated space for customers to track
                                    rewards and discover new deals.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                        <Star className="h-3 w-3 fill-purple-600 text-purple-600" />{' '}
                                        Real-time stamp tracking
                                    </li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section
                    id="how-it-works"
                    className="relative z-10 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                            <h2
                                className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl"
                                style={{ color: '#F4B942' }} // Purple from image
                            >
                                How It Works
                            </h2>
                            <p className="mx-auto max-w-3xl px-4 text-base text-gray-600 sm:text-lg lg:text-xl">
                                Get started in minutes with our simple
                                three-step process
                            </p>
                        </div>

                        {/* Steps Horizontal Grid */}
                        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="relative flex flex-col items-center text-center"
                                >
                                    {/* Icon Box - Using the organic shape from the screenshot */}
                                    <div
                                        className="relative mb-8 flex h-20 w-20 items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 sm:h-24 sm:w-24"
                                        style={{
                                            backgroundColor: '#F4B942',
                                            borderRadius:
                                                '30% 70% 70% 30% / 30% 30% 70% 70%',
                                        }}
                                    >
                                        {step.icon}
                                    </div>

                                    {/* Text Content */}
                                    <h3
                                        className="mb-3 text-xl font-bold sm:text-2xl"
                                        style={{ color: '#F4B942' }}
                                    >
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                                        {step.desc}
                                    </p>

                                    {/* Curved Connector Arrows (Hidden on mobile) */}
                                    {index < 2 && (
                                        <div className="absolute top-0 left-[65%] hidden w-full md:block">
                                            <svg
                                                width="100%"
                                                height="50"
                                                viewBox="0 0 100 40"
                                                fill="none"
                                                className="opacity-40"
                                            >
                                                <path
                                                    d="M0 20C25 5 75 5 100 20"
                                                    stroke="#94a3b8"
                                                    strokeWidth="2"
                                                    strokeDasharray="6 6"
                                                />
                                                <polygon
                                                    points="98,20 90,15 91,20 90,25"
                                                    fill="#94a3b8"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Updated CTA Button */}
                        <div className="mt-16 flex justify-center">
                            <div
                                className="group flex w-full cursor-pointer items-center justify-center rounded-full py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto sm:px-10 sm:py-4 sm:text-lg"
                                style={{ backgroundColor: '#F4B942' }}
                            >
                                <a
                                    href="/documentation"
                                    target="_blank"
                                    className="text-white"
                                >
                                    Full guide
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section
                    id="pricing"
                    className="relative z-10 bg-primary/10 px-4 py-16 sm:px-6 sm:py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center sm:mb-16">
                            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-black/70 sm:text-lg">
                                Start now for free.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-5xl">
                            {/* Free Plan (Starter) */}
                            <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Starter
                                    </h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                                            ₱0
                                        </span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">
                                            /forever
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Perfect for small shops starting out.
                                    </p>
                                </div>
                                <ul className="mb-8 flex-1 space-y-4">
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Unlimited customers
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Unlimited stamps and rewards
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Full access to Customer Analytics
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Custom Card & QR Code Builder
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Dedicated Support (Email/Chat)
                                    </li>
                                </ul>
                                <button
                                    onClick={() => setLoginDialogOpen(true)}
                                    className="w-full rounded-xl border-2 border-primary py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                                >
                                    Get Started
                                </button>
                            </div>

                            {/* Pro Plan only */}
                            <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-white p-8 shadow-xl transition-all hover:scale-[1.02]">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                                    FOR GROWING BRANDS
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Pro
                                    </h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                                            ₱99
                                        </span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">
                                            /month
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Everything in Free, plus branding tools.
                                    </p>
                                </div>
                                <ul className="mb-8 flex-1 space-y-4">
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Custom landing page
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Globe className="h-5 w-5 text-primary" />
                                        yourbusiness.stampbayan.com
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Palette className="h-5 w-5 text-primary" />
                                        Show your logo
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Headphones className="h-5 w-5 text-primary" />
                                        Priority support
                                    </li>
                                    <hr className="my-4 border-gray-100" />
                                    <li className="flex items-center gap-3 text-sm text-gray-500 italic">
                                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                        Includes all Free features
                                    </li>
                                    <li className="flex cursor-pointer items-center gap-3 text-sm text-blue-500 italic underline">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        <a href="https://tinybubbles2dartcafe.stampbayan.com/">
                                            Sample Website
                                        </a>
                                    </li>
                                </ul>
                                <a
                                    href="https://www.facebook.com/profile.php?id=61584319949414"
                                    target="_blank"
                                    className="w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
                                >
                                    Inquire Now
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section
                    id="faq"
                    className="relative overflow-hidden bg-slate-50 py-16 sm:py-24"
                >
                    {/* Subtle Background Glow for Modern Aesthetic */}
                    <div className="absolute top-0 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

                    <div className="mx-auto max-w-3xl px-6">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                Questions? We have answers.
                            </h2>
                            <p className="mx-auto max-w-lg text-lg text-slate-600">
                                Everything you need to know about StampBayan and
                                how digital loyalty works.
                            </p>
                        </div>

                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            {[
                                {
                                    id: 'item-1',
                                    q: 'What is StampBayan?',
                                    a: "StampBayan is a modern Customer Loyalty Card system where businesses can reward their customers for coming back. Say goodbye to paper punch cards and hello to a digital solution that's easy for both you and your customers.",
                                },
                                {
                                    id: 'item-2',
                                    q: 'What is your goal?',
                                    a: "Our goal is to bridge the digital gap for local businesses. We want to show that having a professional loyalty system doesn't have to be expensive—it's actually a powerful tool to help you grow and thrive.",
                                },
                                {
                                    id: 'item-3',
                                    q: 'How will this help my business?',
                                    a: 'Increasing customer retention by just 5% can boost profits by up to 95%. Loyal customers spend 67% more than new ones. With StampBayan, you turn one-time visitors into lifelong patrons.',
                                },
                                {
                                    id: 'item-4',
                                    q: 'What is Customer Analytics?',
                                    a: (
                                        <div className="space-y-3">
                                            <p>
                                                Our analytics give you a
                                                bird's-eye view of your business
                                                performance:
                                            </p>
                                            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {[
                                                    'Customer traffic by day',
                                                    'Visit frequency',
                                                    'New customer count',
                                                    'Peak hours and trends',
                                                ].map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-center text-sm text-slate-600"
                                                    >
                                                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ),
                                },
                                {
                                    id: 'item-5',
                                    q: 'What makes StampBayan different?',
                                    a: "We believe small businesses deserve enterprise-grade tools. We've stripped away the complexity and high costs of traditional systems, delivering a straightforward solution focused on real growth.",
                                },
                            ].map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="group rounded-2xl border border-slate-200 bg-white px-6 shadow-sm transition-all duration-300 data-[state=open]:border-primary/50 data-[state=open]:shadow-md data-[state=open]:shadow-primary/5"
                                >
                                    <AccordionTrigger className="py-6 text-left text-lg font-semibold text-slate-900 hover:text-primary hover:no-underline sm:text-xl">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* Footer - The approved dark footer */}
                <footer className="bg-primary px-4 py-12 sm:px-6">
                    <div className="mx-auto grid max-w-7xl gap-8 text-sm text-white/70 md:grid-cols-4">
                        <div className="md:col-span-1">
                            <img
                                src={LOGO}
                                alt="StampBayan Logo"
                                className="mb-4 h-8"
                            />
                            <p className="mb-4">
                                Digital Loyalty for Filipino Businesses.
                            </p>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.facebook.com/profile.php?id=61584319949414"
                                    target="_blank"
                                >
                                    <Facebook className="h-5 w-5 cursor-pointer transition hover:text-white" />
                                </a>
                                <Instagram className="h-5 w-5 cursor-pointer transition hover:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-3">
                            <div>
                                <h4 className="mb-3 font-bold text-white">
                                    Navigate
                                </h4>
                                <ul>
                                    <li>
                                        <a
                                            href="#benefits"
                                            onClick={(e) =>
                                                scrollToSection(e, '#benefits')
                                            }
                                            className="hover:text-white"
                                        >
                                            Benefits
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#features"
                                            onClick={(e) =>
                                                scrollToSection(e, '#features')
                                            }
                                            className="hover:text-white"
                                        >
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#pricing"
                                            onClick={(e) =>
                                                scrollToSection(e, '#pricing')
                                            }
                                            className="hover:text-white"
                                        >
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#faq"
                                            onClick={(e) =>
                                                scrollToSection(e, '#faq')
                                            }
                                            className="hover:text-white"
                                        >
                                            FAQ
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-3 font-bold text-white">
                                    Contact
                                </h4>
                                <p className="mb-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-white/50" />{' '}
                                    stampbayan@gmail.com
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-white/50" />{' '}
                                    +63 9266887267
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
                        &copy; {new Date().getFullYear()} StampBayan. All rights
                        reserved.
                    </div>
                </footer>

                {/* Floating Download Button */}
                <button
                    onClick={() => setDownloadDialogOpen(true)}
                    className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/80 to-primary/90 px-6 py-3 text-white shadow-2xl transition-all hover:scale-110 lg:hidden"
                >
                    <Download className="h-5 w-5" />
                    <span className="hidden font-semibold sm:inline">
                        Download App
                    </span>
                </button>
            </div>

            {/* <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group animate-bounce"
        style={{
          animation: 'bounce 2s infinite'
        }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      </button> */}

            {/* Download App Dialog */}
            <Dialog
                open={downloadDialogOpen}
                onOpenChange={setDownloadDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold">
                            Download StampBayan
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Choose your account type to download
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Customer App */}
                        <button
                            onClick={() => handleDownloadApp('customer')}
                            className="group w-full rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-green-500 hover:bg-green-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-500">
                                    <svg
                                        className="h-6 w-6 text-green-600 group-hover:text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-bold">Customer App</h3>
                                    <p className="text-sm text-gray-600">
                                        Track rewards
                                    </p>
                                </div>
                                <Download className="h-5 w-5" />
                            </div>
                        </button>

                        {/* Business App */}
                        <button
                            onClick={() => handleDownloadApp('business')}
                            className="group w-full rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-blue-500 hover:bg-blue-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-500">
                                    <svg
                                        className="h-6 w-6 text-blue-600 group-hover:text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-bold">Business App</h3>
                                    <p className="text-sm text-gray-600">
                                        Manage program
                                    </p>
                                </div>
                                <Download className="h-5 w-5" />
                            </div>
                        </button>

                        {/* iOS Instructions */}
                        {isIOS && (
                            <div className="rounded-xl bg-blue-50 p-4">
                                <div className="mb-2 font-semibold text-blue-900">
                                    📱 iOS Installation:
                                </div>
                                <ol className="space-y-1 text-sm text-blue-800">
                                    <li>1. Tap Share button in Safari</li>
                                    <li>2. Tap "Add to Home Screen"</li>
                                    <li>3. Name it "StampBayan" and tap Add</li>
                                </ol>
                            </div>
                        )}

                        {/* Android Instructions */}
                        {isAndroid && !deferredPrompt && (
                            <div className="rounded-xl bg-green-50 p-4">
                                <div className="mb-2 font-semibold text-green-900">
                                    📱 Chrome Installation:
                                </div>
                                <ol className="space-y-1 text-sm text-green-800">
                                    <li>1. Tap menu (⋮) in Chrome</li>
                                    <li>2. Tap "Add to Home screen"</li>
                                    <li>3. Name it "StampBayan"</li>
                                </ol>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>


            <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
        </>
    );
}
