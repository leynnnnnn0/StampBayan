import { Facebook, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ANNOUNCEMENT_KEY = 'stamp-bayan-announcement-april-2026';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: '📱',
        title: 'New Customer UI',
        description: 'Redesigned interface for a smoother customer experience.',
    },
    {
        icon: '🔢',
        title: 'Multistamps in One StampCode',
        description: 'Give multiple stamps in a single scan — faster, easier.',
    },
    {
        icon: '🏢',
        title: 'Enterprise Plan',
        description:
            'Built for multi-branch businesses with advanced controls.',
    },
    {
        icon: '📶',
        title: 'Full Offline Support',
        description: 'The loyalty card app now works even without internet.',
    },
];

export default function AnnouncementModal() {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(ANNOUNCEMENT_KEY);
        if (!dismissed) {
            const t = setTimeout(() => setVisible(true), 600);
            return () => clearTimeout(t);
        }
    }, []);

    const dismiss = () => {
        setClosing(true);
        setTimeout(() => {
            localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
            setVisible(false);
            setClosing(false);
        }, 300);
    };

    if (!visible) return null;

    return (
        // Full-screen overlay — covers everything including any white gaps
        <div
            className={`min-h-screen fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
                closing ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
                backgroundColor: 'rgba(10, 8, 0, 0.88)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            }}
            onClick={dismiss}
        >
            {/* Modal card */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 ${
                    closing
                        ? 'translate-y-6 scale-95 opacity-0'
                        : 'translate-y-0 scale-100 opacity-100'
                }`}
                style={{
                    background:
                        'linear-gradient(160deg, #1c1c1e 0%, #2a1f00 60%, #1c1c1e 100%)',
                    border: '1px solid rgba(245,166,35,0.2)',
                    boxShadow:
                        '0 0 80px rgba(245,166,35,0.1), 0 32px 64px rgba(0,0,0,0.6)',
                }}
            >
                {/* Ambient glow */}
                <div
                    className="pointer-events-none absolute top-0 left-1/2 h-48 w-96 -translate-x-1/2"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, rgba(245,166,35,0.15) 0%, transparent 70%)',
                    }}
                />

                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute top-4 right-4 z-10 rounded-full p-2 transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    aria-label="Close"
                >
                    <X className="h-4 w-4 text-gray-400" />
                </button>

                {/* Header */}
                <div className="relative px-7 pt-8 pb-5">
                    <div
                        className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
                        style={{
                            background: 'rgba(245,166,35,0.12)',
                            border: '1px solid rgba(245,166,35,0.3)',
                            color: '#F5A623',
                        }}
                    >
                        <Sparkles className="h-3 w-3" />
                        Coming Soon
                    </div>

                    <p className="mb-1 text-sm" style={{ color: '#888' }}>
                        Thank you for your continuous support!
                    </p>
                    <h2
                        className="text-[2rem] leading-tight font-black"
                        style={{ color: '#fff', letterSpacing: '-0.02em' }}
                    >
                        New Amazing
                        <br />
                        <span style={{ color: '#F5A623' }}>Features</span> Ahead
                        🎉
                    </h2>
                </div>

                {/* Feature grid */}
                <div className="px-7 pb-5">
                    <div className="grid grid-cols-2 gap-2.5">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="flex flex-col gap-1.5 rounded-2xl p-3.5"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                }}
                            >
                                <span className="text-xl">{f.icon}</span>
                                <p
                                    className="text-xs leading-snug font-bold"
                                    style={{ color: '#f0f0f0' }}
                                >
                                    {f.title}
                                </p>
                                <p
                                    className="text-xs leading-snug"
                                    style={{ color: '#666' }}
                                >
                                    {f.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div
                    className="mx-7 mb-5"
                    style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.07)',
                    }}
                />

                {/* Facebook CTA */}
                <div className="px-7 pb-4">
                    <a
                        href="https://www.facebook.com/profile.php?id=61584319949414"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:brightness-110 active:scale-95"
                        style={{
                            background: 'rgba(24,119,242,0.12)',
                            border: '1px solid rgba(24,119,242,0.3)',
                            textDecoration: 'none',
                        }}
                    >
                        <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ background: '#1877F2' }}
                        >
                            <Facebook className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p
                                className="text-sm font-bold"
                                style={{ color: '#fff' }}
                            >
                                Follow us on Facebook
                            </p>
                            <p className="text-xs" style={{ color: '#666' }}>
                                Stay updated on new features & announcements
                            </p>
                        </div>
                    </a>
                </div>

                {/* CTA button */}
                <div className="px-7 pb-7">
                    <button
                        onClick={dismiss}
                        className="w-full rounded-2xl py-3.5 text-sm font-bold transition-all hover:brightness-110 active:scale-95"
                        style={{
                            background:
                                'linear-gradient(135deg, #F5A623 0%, #e8920f 100%)',
                            color: '#1a1000',
                            letterSpacing: '0.01em',
                        }}
                    >
                        Got it, can't wait!
                    </button>
                </div>
            </div>
        </div>
    );
}
