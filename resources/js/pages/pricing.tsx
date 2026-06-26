import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Instagram,
    Menu,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Star,
    Youtube,
    X,
} from 'lucide-react';
import { useState } from 'react';

import MainLogo from '../../../public/images/mainLogo.png';

const plans = [
    {
        name: 'Starter',
        description: 'Perfect for small shops starting out.',
        price: '₱0',
        period: '/forever',
        note: 'No credit card required',
        cta: 'Get Started',
        href: '/register',
        badge: 'Free',
        features: [
            'Unlimited customers',
            'Unlimited stamps and rewards',
            'Full access to Customer Analytics',
            'Custom Card & QR Code Builder',
            'Dedicated Support (Email/Chat)',
        ],
    },
    {
        name: 'Pro',
        description: 'Everything in Free, plus branding tools.',
        price: '₱99',
        period: '/month',
        note: 'For growing brands',
        cta: 'Choose Pro',
        href: '/register',
        featured: true,
        features: [
            'Custom landing page',
            'yourbusiness.stampbayan.com',
            'Show your logo',
            'Priority support',
            'Includes all Free features',
        ],
    },
    {
        name: 'Enterprise',
        description: 'A custom business solution for larger launches.',
        price: 'Contact us',
        period: '',
        note: 'No public price yet',
        cta: 'Talk to Us',
        href: 'mailto:stampbayan@gmail.com',
        badge: 'Custom',
        features: [
            'Custom UI/UX Design',
            'Next.js & Tailwind CSS Architecture',
            'API Integration & Authentication',
            '24/7 Priority Support',
        ],
    },
];

const footerLinks = [
    {
        title: 'Platform',
        links: [
            { label: 'Admin Login', href: '/login' },
            { label: 'Staff Login', href: '/staff/login' },
            { label: 'Customer Login', href: '/customer/login' },
        ],
    },
    {
        title: 'Business Tools',
        links: [
            { label: 'Card Templates', href: '/business/card-templates' },
            { label: 'Customer List', href: '/business/customers' },
            { label: 'Stamp Codes', href: '/business/stamp-codes' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'Pricing', href: '/pricing' },
            { label: 'About', href: '#about' },
            { label: 'Contact', href: 'mailto:stampbayan@gmail.com' },
        ],
    },
];

function Logo() {
    return (
        <a href="/" className="flex items-center gap-2 font-semibold">
            <img src={MainLogo} alt="StampBayan Logo" className="h-10" />
        </a>
    );
}

export default function Pricing() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <Head title="Pricing Plans - StampBayan" />

            <main className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950">
                <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100/70 bg-white/90 shadow-sm shadow-slate-200/30 backdrop-blur-xl">
                    <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                        <Logo />

                        <div className="hidden items-center gap-9 lg:flex">
                            <a
                                href="/"
                                className="text-sm font-medium text-slate-700 transition hover:text-primary"
                            >
                                Platform
                            </a>
                            <a
                                href="/documentation"
                                className="flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-primary"
                            >
                                Resources
                                <ChevronDown className="h-3.5 w-3.5" />
                            </a>
                            <a
                                href="/pricing"
                                className="text-sm font-medium text-primary"
                            >
                                Pricing
                            </a>
                        </div>

                        <div className="hidden items-center gap-3 lg:flex">
                            <a
                                href="/login"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                            >
                                Sign in
                            </a>
                            <a
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
                            >
                                Create Account
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>

                        <button
                            type="button"
                            aria-label="Toggle navigation"
                            onClick={() => setMobileOpen((open) => !open)}
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
                            <div className="mx-auto grid max-w-7xl gap-2">
                                {[
                                    ['Platform', '/'],
                                    ['Resources', '/documentation'],
                                    ['Pricing', '/pricing'],
                                    ['Sign in', '/login'],
                                    ['Create Account', '/register'],
                                ].map(([label, href]) => (
                                    <a
                                        key={label}
                                        href={href}
                                        className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                <section className="relative px-5 pt-32 pb-16 sm:pt-36 lg:pt-40">
                    <div className="absolute inset-x-0 top-20 mx-auto h-[520px] max-w-5xl bg-[radial-gradient(circle_at_center,rgba(244,185,66,0.24),transparent_66%)] blur-3xl" />
                    <div className="relative mx-auto max-w-4xl text-center">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Simple plans for local loyalty programs
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Pricing Plans
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                            Start for free and upgrade as your brand grows.
                        </p>
                    </div>

                    <div className="relative mx-auto mt-24 grid max-w-7xl gap-10 lg:grid-cols-3 lg:items-start">
                        {plans.map((plan) => (
                            <article
                                key={plan.name}
                                className={`relative rounded-3xl border bg-white p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 sm:p-8 ${
                                    plan.featured
                                        ? 'border-primary ring-4 ring-primary/20 lg:-mt-8'
                                        : 'border-slate-200'
                                }`}
                            >
                                {plan.featured && (
                                    <div className="absolute inset-x-0 -top-8 mx-auto flex w-fit items-center gap-2 rounded-t-2xl bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20">
                                        <Star className="h-4 w-4 fill-white" />
                                        {plan.badge}
                                    </div>
                                )}

                                {!plan.featured && (
                                    <span className="mb-6 inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
                                        {plan.badge}
                                    </span>
                                )}

                                <div className="min-h-32">
                                    <h2 className="text-2xl font-bold">
                                        {plan.name}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mt-7">
                                    <div className="flex flex-wrap items-end gap-2">
                                        <span
                                            className={`font-semibold tracking-tight ${
                                                plan.name === 'Enterprise'
                                                    ? 'text-4xl'
                                                    : 'text-5xl'
                                            }`}
                                        >
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="pb-2 text-sm font-medium text-slate-500">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                        {plan.note}
                                    </p>
                                </div>

                                <div className="mt-8 grid gap-3">
                                    <a
                                        href={plan.href}
                                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                                            plan.featured
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
                                                : 'border border-slate-200 bg-white text-slate-800 hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {plan.cta}
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-sm font-bold">
                                        What&apos;s inside:
                                    </h3>
                                    <ul className="mt-4 divide-y divide-slate-100">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-3 py-3 text-sm text-slate-700"
                                            >
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="relative mx-auto mt-12 max-w-4xl rounded-3xl border border-primary/20 bg-primary/10 p-6 text-center sm:p-8">
                        <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
                        <h2 className="mt-3 text-xl font-bold">
                            Built for StampBayan workflows
                        </h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Plans are based on the loyalty tools already in
                            StampBayan: customers, stamps, rewards, analytics,
                            QR cards, and business support.
                        </p>
                    </div>
                </section>

                <footer className="relative overflow-hidden bg-blue-600 px-5 pt-16 pb-10 text-white">
                    <div className="absolute inset-x-0 top-0 h-20 bg-white [clip-path:ellipse(70%_100%_at_50%_0%)]" />
                    <div className="relative mx-auto max-w-6xl pt-14">
                        <div className="text-center">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white/20 text-white">
                                <ShieldCheck className="h-10 w-10" />
                            </div>
                            <h2 className="mt-6 text-3xl font-semibold sm:text-5xl">
                                Ready to begin?
                            </h2>
                            <p className="mt-3 text-sm text-blue-50">
                                Create your free account and start rewarding
                                repeat customers today.
                            </p>
                            <a
                                href="/register"
                                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
                            >
                                Create Account
                                <ArrowRight className="h-4 w-4" />
                            </a>
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

                <a
                    href="#"
                    aria-label="Open chat"
                    className="fixed right-4 bottom-4 z-40 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 transition hover:-translate-y-1 sm:right-5 sm:bottom-5 sm:h-14 sm:w-14"
                >
                    <MessageCircle className="h-6 w-6" />
                </a>
            </main>
        </>
    );
}
