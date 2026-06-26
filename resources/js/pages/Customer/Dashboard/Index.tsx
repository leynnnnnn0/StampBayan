import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    Award,
    Calendar,
    Camera,
    ChevronLeft,
    ChevronRight,
    Gift,
    Home,
    Plus,
    ScanLine,
    Settings,
    ShoppingCart,
    Sparkles,
    Trophy,
    Type,
    User,
    X,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import LOGO from '../../../../images/mainLogo.png';

import { BrowserQRCodeReader } from '@zxing/browser';
import { useEffect } from 'react';
import type { SharedData } from '@/types';

interface Perk {
    id: number;
    stampNumber: number;
    reward: string;
    details: string | null;
    color: string;
}

interface LoyaltyCard {
    id: number;
    logo: string | null;
    name: string;
    heading: string;
    subheading: string;
    stampsNeeded: number;
    mechanics: string;
    backgroundColor: string;
    textColor: string;
    stampColor: string;
    stampFilledColor: string;
    stampEmptyColor: string;
    valid_until_formatted: string;
    stampImage: string | null;
    backgroundImage: string | null;
    footer: string;
    stampShape: 'circle' | 'star' | 'square' | 'hexagon';
    perks: Perk[];
}

interface StampCode {
    id: number;
    loyalty_card_id: number;
    code: string;
    number_of_stamps: number;
    used_at: string;
    customer_id: number;
}

interface CompletedStamp {
    id: number;
    code: string;
    used_at: string;
}

interface CompletedCard {
    id: number;
    loyalty_card_id: number;
    loyalty_card_name: string;
    loyalty_card: LoyaltyCard | null;
    stamps_collected: number;
    completed_at: string;
    card_cycle: number;
    stamps_data:
        | string
        | CompletedStamp[];
}

interface PerkClaim {
    id: number;
    customer_id: number;
    loyalty_card_id: number;
    perk_id: number;
    stamps_at_claim: number;
    is_redeemed: boolean;
    redeemed_at: string | null;
    redeemed_by: number | null;
    remarks: string | null;
    created_at: string;
    perk: Perk;
    loyalty_card: {
        id: number;
        name: string;
        logo: string | null;
    };
}

interface Props {
    cardTemplates: LoyaltyCard[];
    stampCodes: StampCode[];
    completedCards: CompletedCard[];
    customerName: string;
    active_card_id?: number;
    perkClaims: PerkClaim[];
    customer: {
        id: number;
        business_id: number;
        username: string;
    };
    customerQrPayload: string;
    customerQrSvg: string;
}

interface CustomerFlash {
    active_card_id?: number;
    card_completed?: boolean;
    message?: string;
    cycle_number?: number;
    type?: string;
}

type ScanControls = {
    stop: () => void;
};

type CustomerDashboardSnapshot = {
    cardTemplates: LoyaltyCard[];
    stampCodes: StampCode[];
    completedCards: CompletedCard[];
    customerName: string;
    perkClaims: PerkClaim[];
    customer: Props['customer'];
    customerQrPayload: string;
    customerQrSvg: string;
    lastSyncedAt: string;
};

const CUSTOMER_DASHBOARD_CACHE_KEY = 'stampbayan_customer_dashboard';
const CUSTOMER_SESSION_CACHE_KEY = 'stampbayan_customer_session';
const CUSTOMER_DASHBOARD_STATE_KEY = 'stampbayan_customer_dashboard_state';
const CUSTOMER_DASHBOARD_TABS = ['home', 'perks', 'history', 'account'];

function completedCardStamps(card: CompletedCard): CompletedStamp[] {
    return typeof card.stamps_data === 'string'
        ? (JSON.parse(card.stamps_data) as CompletedStamp[])
        : card.stamps_data;
}

export default function Index({
    cardTemplates: liveCardTemplates,
    stampCodes: liveStampCodes,
    completedCards: liveCompletedCards,
    customerName: liveCustomerName,
    perkClaims: livePerkClaims,
    customer: liveCustomer,
    customerQrPayload: liveCustomerQrPayload,
    customerQrSvg: liveCustomerQrSvg,
}: Props) {
    const readCachedSnapshot = (): CustomerDashboardSnapshot | null => {
        if (typeof window === 'undefined') return null;

        try {
            const raw = window.localStorage.getItem(
                CUSTOMER_DASHBOARD_CACHE_KEY,
            );
            return raw ? (JSON.parse(raw) as CustomerDashboardSnapshot) : null;
        } catch {
            return null;
        }
    };

    const [isOnline, setIsOnline] = useState(
        typeof navigator === 'undefined' ? true : navigator.onLine,
    );
    const [cachedSnapshot, setCachedSnapshot] =
        useState<CustomerDashboardSnapshot | null>(readCachedSnapshot);
    const liveSnapshot: CustomerDashboardSnapshot = {
        cardTemplates: liveCardTemplates,
        stampCodes: liveStampCodes,
        completedCards: liveCompletedCards,
        customerName: liveCustomerName,
        perkClaims: livePerkClaims,
        customer: liveCustomer,
        customerQrPayload: liveCustomerQrPayload,
        customerQrSvg: liveCustomerQrSvg,
        lastSyncedAt: new Date().toISOString(),
    };
    const dashboardSnapshot =
        !isOnline && cachedSnapshot ? cachedSnapshot : liveSnapshot;
    const {
        cardTemplates,
        stampCodes,
        completedCards,
        customerName,
        perkClaims,
        customer,
        customerQrPayload,
        customerQrSvg,
    } = dashboardSnapshot;

    const readSavedDashboardState = () => {
        if (typeof window === 'undefined') {
            return { activeTab: 'home', cardId: null as number | null };
        }

        try {
            const params = new URLSearchParams(window.location.search);
            const tabFromUrl = params.get('tab');
            const cardFromUrl = params.get('card');
            const saved = JSON.parse(
                window.localStorage.getItem(CUSTOMER_DASHBOARD_STATE_KEY) ||
                    '{}',
            ) as { activeTab?: string; cardId?: number };

            const activeTab =
                tabFromUrl && CUSTOMER_DASHBOARD_TABS.includes(tabFromUrl)
                    ? tabFromUrl
                    : saved.activeTab &&
                        CUSTOMER_DASHBOARD_TABS.includes(saved.activeTab)
                      ? saved.activeTab
                      : 'home';

            return {
                activeTab,
                cardId: cardFromUrl
                    ? Number(cardFromUrl)
                    : saved.cardId
                      ? Number(saved.cardId)
                      : null,
            };
        } catch {
            return { activeTab: 'home', cardId: null as number | null };
        }
    };

    const savedDashboardState = readSavedDashboardState();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [activeTab, setActiveTab] = useState(savedDashboardState.activeTab);
    const [recordDialogOpen, setRecordDialogOpen] = useState(false);
    const [methodDialogOpen, setMethodDialogOpen] = useState(false);
    const [scanDialogOpen, setScanDialogOpen] = useState(false);
    const [selectedCompletedCard, setSelectedCompletedCard] =
        useState<CompletedCard | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(false);
    usePage<SharedData & { flash?: CustomerFlash }>();
    const controlsRef = useRef<ScanControls | null>(null);
    const { data, setData, errors, post, processing, reset } = useForm({
        code: '',
        loyalty_card_id: cardTemplates[0]?.id || null,
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isOnline) return;

        const snapshot = liveSnapshot;

        try {
            window.localStorage.setItem(
                CUSTOMER_DASHBOARD_CACHE_KEY,
                JSON.stringify(snapshot),
            );
            window.localStorage.setItem(
                CUSTOMER_SESSION_CACHE_KEY,
                JSON.stringify({
                    isCustomer: true,
                    customerId: liveCustomer.id,
                    username: liveCustomer.username,
                    lastSyncedAt: snapshot.lastSyncedAt,
                }),
            );
            setCachedSnapshot(snapshot);
        } catch {
            // Cache is best-effort; the online dashboard remains usable.
        }
    }, [
        isOnline,
        liveCardTemplates,
        liveStampCodes,
        liveCompletedCards,
        liveCustomerName,
        livePerkClaims,
        liveCustomer,
        liveCustomerQrPayload,
        liveCustomerQrSvg,
    ]);

    useEffect(() => {
        const savedCardId = savedDashboardState.cardId;
        if (!savedCardId || cardTemplates.length === 0) return;

        const savedIndex = cardTemplates.findIndex(
            (card) => card.id === savedCardId,
        );
        if (savedIndex !== -1) {
            setCurrentCardIndex(savedIndex);
        }
    }, [cardTemplates]);

    useEffect(() => {
        if (cardTemplates.length === 0) return;

        const cardId = cardTemplates[currentCardIndex]?.id ?? null;

        try {
            window.localStorage.setItem(
                CUSTOMER_DASHBOARD_STATE_KEY,
                JSON.stringify({ activeTab, cardId }),
            );

            const url = new URL(window.location.href);
            url.searchParams.set('tab', activeTab);
            if (cardId) {
                url.searchParams.set('card', String(cardId));
            } else {
                url.searchParams.delete('card');
            }
            window.history.replaceState({}, '', url);
        } catch {
            // UI state persistence is best-effort.
        }
    }, [activeTab, currentCardIndex, cardTemplates]);

    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [profileTab, setProfileTab] = useState('info');

    const {
        data: profileData,
        setData: setProfileData,
        errors: profileErrors,
        post: postProfile,
        processing: profileProcessing,
        reset: resetProfile,
    } = useForm({
        username: customer.username,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        post: postPassword,
        processing: passwordProcessing,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        postProfile('/customer/profile/update', {
            onSuccess: () => {
                toast.success('Profile updated successfully');
                resetProfile();
            },
            onError: (e) => {
                if (e.error) {
                    toast.error(e.error);
                    return;
                }
                toast.error('Failed to update profile');
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        postPassword('/customer/password/update', {
            onSuccess: () => {
                toast.success('Password updated successfully');
                resetPassword();
                setProfileTab('info');
            },
            onError: (e) => {
                if (e.error) {
                    toast.error(e.error);
                    return;
                }
                toast.error('Failed to update password');
            },
        });
    };

    const currentCard = cardTemplates[currentCardIndex];

    const currentCardStamps = useMemo(() => {
        if (!stampCodes || !currentCard) return [];
        return stampCodes.filter(
            (stamp) => stamp.loyalty_card_id === currentCard.id,
        );
    }, [stampCodes, currentCard]);

    const totalStamps =
        currentCardStamps?.reduce(
            (sum, item) => sum + item.number_of_stamps,
            0,
        ) || 0;

    const currentCardPerks = useMemo(() => {
        return currentCard != undefined ? currentCard?.perks : [];
    }, [currentCard]);

    const nextCard = () =>
        setCurrentCardIndex((prev) => (prev + 1) % cardTemplates.length);
    const prevCard = () =>
        setCurrentCardIndex(
            (prev) => (prev - 1 + cardTemplates.length) % cardTemplates.length,
        );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCompletedDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatLastSynced = (value?: string) => {
        if (!value) return 'not synced yet';

        const diffMs = Date.now() - new Date(value).getTime();
        const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

        if (diffMinutes < 1) return 'just now';
        if (diffMinutes === 1) return '1 minute ago';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;

        return new Date(value).toLocaleString();
    };

    const handleRecordStamp = () => {
        if (!isOnline) {
            toast.info('You are offline. Show your personal QR to the business to receive stamps.');
            return;
        }

        setMethodDialogOpen(true);
    };

    const handleManualEntry = () => {
        if (!isOnline) {
            toast.info('Manual stamp entry is disabled while offline.');
            return;
        }

        setMethodDialogOpen(false);
        setRecordDialogOpen(true);
        setData('loyalty_card_id', currentCard?.id);
    };

    const handleScanQR = async () => {
        if (!isOnline) {
            toast.info('QR scanning is disabled while offline.');
            return;
        }

        setMethodDialogOpen(false);
        setScanDialogOpen(true);
        setScanning(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
        try {
            const codeReader = new BrowserQRCodeReader();
            if (!videoRef.current) throw new Error('Video element not ready');
            const videoInputDevices =
                await BrowserQRCodeReader.listVideoInputDevices();
            if (videoInputDevices.length === 0)
                throw new Error('No camera devices found');
            const backCamera = videoInputDevices.find(
                (device) =>
                    device.label.toLowerCase().includes('back') ||
                    device.label.toLowerCase().includes('rear') ||
                    device.label.toLowerCase().includes('environment'),
            );
            const selectedDeviceId =
                backCamera?.deviceId ||
                videoInputDevices[videoInputDevices.length - 1]?.deviceId;
            const controls = await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result, error, controls) => {
                    controlsRef.current = controls;
                    if (result) {
                        const scannedCode = result.getText();
                        router.post(
                            '/stamps/record',
                            {
                                loyalty_card_id: currentCard?.id,
                                code: scannedCode,
                            },
                            {
                                onSuccess: (page) => {
                                    const flash = page.props.flash as CustomerFlash | undefined;
                                    const index = cardTemplates.findIndex(
                                        (card) =>
                                            card.id ===
                                            flash?.active_card_id,
                                    );
                                    if (index !== -1)
                                        setCurrentCardIndex(index);
                                    if (flash?.card_completed) {
                                        toast.success(
                                            `🎉 ${flash.message}`,
                                            {
                                                description: `You completed cycle #${flash.cycle_number}!`,
                                            },
                                        );
                                    } else {
                                        toast.success('Stamped Successfully.');
                                    }
                                    if (controlsRef.current)
                                        controlsRef.current.stop();
                                    setScanDialogOpen(false);
                                    setScanning(false);
                                    reset();
                                },
                                onError: (errors) => {
                                    if (errors.code) toast.error(errors.code);
                                    else
                                        toast.error(
                                            'Failed to record stamp. Please try again.',
                                        );
                                    if (controlsRef.current)
                                        controlsRef.current.stop();
                                    setScanDialogOpen(false);
                                    setScanning(false);
                                },
                                onFinish: () => {
                                    if (controlsRef.current)
                                        controlsRef.current.stop();
                                    stopCamera();
                                },
                            },
                        );
                    }
                },
            );
            controlsRef.current = controls;
        } catch (err) {
            const errorName = err instanceof Error ? err.name : '';
            if (errorName === 'NotAllowedError')
                toast.error('Camera permission denied.');
            else if (errorName === 'NotFoundError')
                toast.error('No camera found.');
            else if (errorName === 'NotReadableError')
                toast.error('Camera is already in use.');
            else toast.error('Failed to access camera.');
            setScanDialogOpen(false);
            setScanning(false);
        }
    };

    const stopCamera = () => {
        if (controlsRef.current) {
            try {
                controlsRef.current.stop();
            } catch {
                controlsRef.current = null;
            }
            controlsRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setScanning(false);
        setScanDialogOpen(false);
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);
    useEffect(() => {
        if (!scanDialogOpen) stopCamera();
    }, [scanDialogOpen]);

    const handleSubmitCode = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stamps/record', {
            onSuccess: (page) => {
                const flash = page.props.flash as CustomerFlash | undefined;
                const index = cardTemplates.findIndex(
                    (card) => card.id === flash?.active_card_id,
                );
                if (index !== -1) setCurrentCardIndex(index);
                if (flash?.card_completed) {
                    toast.success(`🎉 ${flash.message}`, {
                        description: `You completed cycle #${flash.cycle_number}!`,
                    });
                } else {
                    toast.success('Stamped Successfully.');
                }
                reset();
                setRecordDialogOpen(false);
            },
            onError: (errors) => {
                if (errors.code) toast.error(errors.code);
                else toast.error('Failed to record stamp. Please try again.');
            },
        });
    };

    const StampShape = ({
        shape,
        isFilled,
        isReward,
        rewardText,
        color,
        stampImage,
    }: {
        shape: string;
        isFilled: boolean;
        isReward: boolean;
        rewardText?: string;
        color: string;
        stampImage?: string | null;
    }) => {
        const fillColor = isFilled
            ? currentCard.stampFilledColor || color
            : currentCard.stampEmptyColor;
        const strokeColor = isFilled ? '#FFFFFF' : '#D1D5DB';
        let stampImageUrl = currentCard.stampImage
            ? `/${currentCard.stampImage}`
            : null;
        if (stampImage) stampImageUrl = `/${stampImage}`;

        const shapes: Record<string, React.ReactElement> = {
            circle: (
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        {stampImageUrl && (
                            <pattern
                                id="stampPattern"
                                x="0"
                                y="0"
                                width="1"
                                height="1"
                            >
                                <image
                                    href={stampImageUrl}
                                    x="0"
                                    y="0"
                                    width="100"
                                    height="100"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </pattern>
                        )}
                    </defs>
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill={
                            stampImageUrl && isFilled
                                ? 'url(#stampPattern)'
                                : fillColor
                        }
                        stroke={strokeColor}
                        strokeWidth="2"
                    />
                </svg>
            ),
            star: (
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        {stampImageUrl && (
                            <pattern
                                id="stampPattern"
                                x="0"
                                y="0"
                                width="1"
                                height="1"
                            >
                                <image
                                    href={stampImageUrl}
                                    x="0"
                                    y="0"
                                    width="100"
                                    height="100"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </pattern>
                        )}
                    </defs>
                    <path
                        d="M50 5 L55 20 L70 15 L70 30 L85 35 L75 47 L85 59 L70 64 L70 79 L55 74 L50 89 L45 74 L30 79 L30 64 L15 59 L25 47 L15 35 L30 30 L30 15 L45 20 Z"
                        fill={
                            stampImageUrl && isFilled
                                ? 'url(#stampPattern)'
                                : fillColor
                        }
                        stroke={strokeColor}
                        strokeWidth="2"
                    />
                </svg>
            ),
            square: (
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        {stampImageUrl && (
                            <pattern
                                id="stampPattern"
                                x="0"
                                y="0"
                                width="1"
                                height="1"
                            >
                                <image
                                    href={stampImageUrl}
                                    x="0"
                                    y="0"
                                    width="100"
                                    height="100"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </pattern>
                        )}
                    </defs>
                    <rect
                        x="10"
                        y="10"
                        width="80"
                        height="80"
                        rx="12"
                        fill={
                            stampImageUrl && isFilled
                                ? 'url(#stampPattern)'
                                : fillColor
                        }
                        stroke={strokeColor}
                        strokeWidth="2"
                    />
                </svg>
            ),
            hexagon: (
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        {stampImageUrl && (
                            <pattern
                                id="stampPattern"
                                x="0"
                                y="0"
                                width="1"
                                height="1"
                            >
                                <image
                                    href={stampImageUrl}
                                    x="0"
                                    y="0"
                                    width="100"
                                    height="100"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </pattern>
                        )}
                    </defs>
                    <path
                        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                        fill={
                            stampImageUrl && isFilled
                                ? 'url(#stampPattern)'
                                : fillColor
                        }
                        stroke={strokeColor}
                        strokeWidth="2"
                    />
                </svg>
            ),
        };

        return (
            <div className="relative h-full w-full">
                {shapes[shape]}
                {isReward && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className="px-1 text-center text-[8px] leading-tight font-bold text-white drop-shadow-lg"
                            style={{
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            }}
                        >
                            {rewardText}
                        </span>
                    </div>
                )}
                {isFilled && !isReward && !stampImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles
                            size={16}
                            className="animate-pulse text-white"
                        />
                    </div>
                )}
            </div>
        );
    };

    const getPerkForStamp = (stampNumber: number) =>
        currentCardPerks.find((p) => p.stampNumber === stampNumber);

    const CompletedCardPreview = ({
        completed,
    }: {
        completed: CompletedCard;
    }) => {
        const cardTemplate =
            cardTemplates.find((c) => c.id === completed.loyalty_card_id) ||
            completed.loyalty_card;
        if (!cardTemplate) return null;
        const logoUrl = cardTemplate.logo ? `/${cardTemplate.logo}` : null;
        const backgroundImageUrl = cardTemplate.backgroundImage
            ? `/${cardTemplate.backgroundImage}`
            : null;
        return (
            <div
                className="cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-transform active:scale-95"
                onClick={() => setSelectedCompletedCard(completed)}
            >
                <div
                    className="flex items-center justify-center p-5"
                    style={{
                        backgroundColor: cardTemplate.backgroundColor,
                        backgroundImage: backgroundImageUrl
                            ? `url(${backgroundImageUrl})`
                            : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div
                        className="w-full rounded-xl p-3 backdrop-blur-sm"
                        style={{
                            backgroundColor: backgroundImageUrl
                                ? 'rgba(0,0,0,0.2)'
                                : 'transparent',
                        }}
                    >
                        {logoUrl && (
                            <div className="mb-2 flex justify-center">
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xl"
                                />
                            </div>
                        )}
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <h3
                                    className="text-base font-bold tracking-wide"
                                    style={{ color: cardTemplate.textColor }}
                                >
                                    {cardTemplate.heading}
                                </h3>
                                <p
                                    className="text-xs opacity-90"
                                    style={{ color: cardTemplate.textColor }}
                                >
                                    Cycle #{completed.card_cycle}
                                </p>
                            </div>
                            <Trophy className="h-7 w-7 text-yellow-300 drop-shadow-lg" />
                        </div>
                        <div className="mb-3 rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur">
                            <div className="mb-1 flex items-center gap-2">
                                <Award className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-semibold text-green-600">
                                    Completed
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-gray-600" />
                                <span className="text-xs text-gray-700">
                                    {formatCompletedDate(
                                        completed.completed_at,
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {Array.from({
                                length: completed.stamps_collected,
                            }).map((_, index) => {
                                const stampNumber = index + 1;
                                const perk = cardTemplate.perks?.find(
                                    (p) => p.stampNumber === stampNumber,
                                );
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center gap-0.5"
                                    >
                                        <div className="h-8 w-8">
                                            <StampShape
                                                shape={cardTemplate.stampShape}
                                                isFilled={true}
                                                isReward={!!perk}
                                                rewardText={perk?.reward}
                                                color={
                                                    perk
                                                        ? perk.color
                                                        : cardTemplate.stampColor
                                                }
                                                stampImage={
                                                    cardTemplate.stampImage
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const logoUrl = currentCard?.logo ? `/${currentCard.logo}` : null;
    const backgroundImageUrl = currentCard?.backgroundImage
        ? `/${currentCard.backgroundImage}`
        : null;
    const customerQrUrl = customerQrSvg
        ? `data:image/svg+xml;utf8,${encodeURIComponent(customerQrSvg)}`
        : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(customerQrPayload)}`;

    const profileDialog = (
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>
                        Update your account information
                    </DialogDescription>
                </DialogHeader>
                <Tabs value={profileTab} onValueChange={setProfileTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Account Info</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="mt-4 space-y-4">
                        <form
                            onSubmit={handleUpdateProfile}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={profileData.username}
                                    onChange={(e) =>
                                        setProfileData(
                                            'username',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter username"
                                />
                                {profileErrors.username && (
                                    <p className="text-sm text-destructive">
                                        {profileErrors.username}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setProfileDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={profileProcessing}
                                >
                                    {profileProcessing
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                    <TabsContent value="password" className="mt-4 space-y-4">
                        <form
                            onSubmit={handleUpdatePassword}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter current password"
                                />
                                {passwordErrors.current_password && (
                                    <p className="text-sm text-destructive">
                                        {passwordErrors.current_password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter new password"
                                />
                                {passwordErrors.password && (
                                    <p className="text-sm text-destructive">
                                        {passwordErrors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Confirm new password"
                                />
                                {passwordErrors.password_confirmation && (
                                    <p className="text-sm text-destructive">
                                        {passwordErrors.password_confirmation}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setProfileTab('info');
                                        resetPassword();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={passwordProcessing}
                                >
                                    {passwordProcessing
                                        ? 'Updating...'
                                        : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );

    if (!cardTemplates || cardTemplates.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                {profileDialog}
                <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <img src={LOGO} alt="business logo" className="h-10" />
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                                <User className="h-5 w-5 text-gray-600" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setProfileDialogOpen(true)}
                            >
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.post('/customer/logout')}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="px-6 py-8">
                    <p className="mt-20 text-center text-gray-500">
                        No loyalty cards available yet.
                    </p>
                </main>
            </div>
        );
    }

    // Bottom nav items
    const navItems = [
        { id: 'home', label: 'Cards', icon: Home },
        { id: 'perks', label: 'Rewards', icon: Gift },
        { id: 'history', label: 'History', icon: Trophy },
        { id: 'account', label: 'Account', icon: User },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {profileDialog}

            {/* ── DESKTOP HEADER (hidden on mobile) ── */}
            <header className="hidden items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm sm:flex">
                <div className="flex items-center gap-8">
                    <img src={LOGO} alt="business logo" className="h-10" />
                    <nav className="flex gap-8">
                        {navItems.slice(0, 3).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`border-b-2 pb-1 text-sm font-semibold transition-colors ${activeTab === item.id ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleRecordStamp}
                        disabled={!isOnline}
                        className="bg-primary text-white hover:bg-primary/80"
                        size="sm"
                    >
                        <Plus className="mr-1 h-4 w-4" /> Record Stamp
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-100">
                                <User className="h-5 w-5 text-gray-600" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setProfileDialogOpen(true)}
                            >
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.post('/customer/logout')}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* ── MOBILE TOP BAR ── */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-5 pt-4 pb-3 sm:hidden">
                <div className="flex items-center gap-2">
                    <img src={LOGO} alt="logo" className="h-8 w-auto" />
                </div>

                <button
                    onClick={handleRecordStamp}
                    disabled={!isOnline}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                    <ScanLine className="h-5 w-5 text-white" />
                </button>
            </div>

            {!isOnline && (
                <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-xs font-medium text-amber-800 sm:text-sm">
                    You are currently offline. Last synced{' '}
                    {formatLastSynced(cachedSnapshot?.lastSyncedAt)}. Showing
                    saved loyalty cards, rewards, history, and your personal QR.
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-0 py-0 pb-24 sm:px-6 sm:py-8 sm:pb-8">
                {/* ── HOME TAB ── */}
                {activeTab === 'home' && (
                    <div className="space-y-0 sm:space-y-6">
                        {/* Card switcher hero */}
                        <div className="overflow-hidden bg-white sm:rounded-2xl sm:shadow-sm">
                            <div className="p-5">
                                <p className="text-xs font-medium text-gray-400">
                                    Welcome back
                                </p>
                                <h1 className="text-lg leading-tight font-bold text-gray-900">
                                    {customerName} 👋
                                </h1>
                            </div>
                            {/* Card navigation header */}
                            {cardTemplates.length > 1 && (
                                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                    <span className="truncate pr-2 text-sm font-semibold text-gray-900">
                                        {currentCard.name.toUpperCase()}
                                    </span>
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                        <button
                                            onClick={prevCard}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                                        >
                                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <span className="w-10 text-center text-xs text-gray-400">
                                            {currentCardIndex + 1} /{' '}
                                            {cardTemplates.length}
                                        </span>
                                        <button
                                            onClick={nextCard}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                                        >
                                            <ChevronRight className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Progress summary */}
                            <div className="px-5 py-3">
                                <div className="mb-2 flex items-end justify-between">
                                    <div>
                                        <span className="text-3xl font-bold text-gray-900">
                                            {totalStamps}
                                        </span>
                                        <span className="ml-1 text-lg text-gray-400">
                                            / {currentCard.stampsNeeded} stamps
                                        </span>
                                    </div>
                                    {totalStamps ===
                                        currentCard.stampsNeeded && (
                                        <Badge className="bg-green-500 text-xs text-white hover:bg-green-600">
                                            🎉 Complete!
                                        </Badge>
                                    )}
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-100">
                                    <div
                                        className="h-2 rounded-full bg-primary transition-all duration-700"
                                        style={{
                                            width: `${Math.min((totalStamps / currentCard.stampsNeeded) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* The Loyalty Card */}
                            <div className="px-4 pb-4">
                                <div
                                    className="overflow-hidden rounded-2xl shadow-lg"
                                    style={{
                                        backgroundColor:
                                            currentCard.backgroundColor,
                                        backgroundImage: backgroundImageUrl
                                            ? `url(${backgroundImageUrl})`
                                            : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    <div
                                        className="p-5 backdrop-blur-sm"
                                        style={{
                                            backgroundColor: backgroundImageUrl
                                                ? 'rgba(0,0,0,0.2)'
                                                : 'transparent',
                                        }}
                                    >
                                        {logoUrl && (
                                            <div className="mb-3 flex justify-center">
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo"
                                                    className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-xl"
                                                />
                                            </div>
                                        )}
                                        <h3
                                            className="mb-0.5 text-center text-lg font-bold tracking-wider"
                                            style={{
                                                color: currentCard.textColor,
                                            }}
                                        >
                                            {currentCard.heading}
                                        </h3>
                                        <p
                                            className="mb-4 text-center text-xs opacity-90"
                                            style={{
                                                color: currentCard.textColor,
                                            }}
                                        >
                                            {currentCard.subheading}
                                        </p>
                                        <div className="mb-4 grid grid-cols-5 gap-2">
                                            {Array.from({
                                                length: currentCard.stampsNeeded,
                                            }).map((_, index) => {
                                                const stampNumber = index + 1;
                                                const perk =
                                                    getPerkForStamp(
                                                        stampNumber,
                                                    );
                                                const isFilled =
                                                    index < totalStamps;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col items-center gap-0.5"
                                                    >
                                                        <div className="aspect-square w-full">
                                                            <StampShape
                                                                shape={
                                                                    currentCard.stampShape
                                                                }
                                                                isFilled={
                                                                    isFilled
                                                                }
                                                                isReward={
                                                                    !!perk
                                                                }
                                                                rewardText={
                                                                    perk?.reward
                                                                }
                                                                color={
                                                                    perk
                                                                        ? perk.color
                                                                        : currentCard.stampColor
                                                                }
                                                            />
                                                        </div>
                                                        <span
                                                            className="text-[8px] font-medium"
                                                            style={{
                                                                color: currentCard.textColor,
                                                            }}
                                                        >
                                                            {stampNumber}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mb-3 rounded-xl bg-white/95 p-3 shadow backdrop-blur">
                                            <p className="text-center text-[10px] leading-relaxed text-gray-800">
                                                {currentCard.mechanics}
                                            </p>
                                        </div>
                                        <div className="mb-3 flex justify-center">
                                            <div className="rounded-xl bg-white p-2 text-center shadow-lg">
                                                <img
                                                    src={customerQrUrl}
                                                    alt="Personal customer QR code"
                                                    className="h-28 w-28"
                                                />
                                                <p className="mt-1 text-[9px] font-semibold text-gray-700">
                                                    scan here
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="border-t pt-2"
                                            style={{
                                                borderColor:
                                                    currentCard.textColor +
                                                    '40',
                                            }}
                                        >
                                            <p
                                                className="text-center text-[9px] font-medium opacity-90"
                                                style={{
                                                    color: currentCard.textColor,
                                                }}
                                            >
                                                {currentCard.footer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Stamps — horizontal scroll on mobile */}
                        <div className="bg-white sm:rounded-2xl sm:shadow-sm">
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                <h2 className="text-base font-bold text-gray-900 mb-3">
                                    Recent Stamps
                                </h2>
                            </div>
                            {currentCardStamps.length > 0 ? (
                                <div className="max-h-56 space-y-3 overflow-y-auto px-5 pb-4">
                                    {currentCardStamps.map((stamp) => (
                                        <div
                                            key={stamp.id}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                                <ShoppingCart className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {currentCard.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(stamp.used_at)}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="border-0 bg-green-50 text-xs text-green-700"
                                            >
                                                + {stamp.number_of_stamps} {stamp.number_of_stamps > 1 ? 'stamps' : 'stamp'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-5 pb-6 text-center text-sm text-gray-400">
                                    No stamps yet — start scanning!
                                </div>
                            )}
                        </div>

                        {/* Rewards for current card */}
                        {currentCardPerks.length > 0 && (
                            <div className="bg-white sm:rounded-2xl sm:shadow-sm">
                                <div className="px-5 pt-4 pb-2">
                                    <h2 className="text-base font-bold text-gray-900">
                                        Awards Awaiting
                                    </h2>
                                </div>
                                <div className="space-y-3 px-5 pb-4">
                                    {currentCardPerks.map((perk) => (
                                        <div
                                            key={perk.id}
                                            className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                                        >
                                            <div
                                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                                                style={{
                                                    backgroundColor: perk.color,
                                                }}
                                            >
                                                {perk.stampNumber}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {perk.reward}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Unlock at {perk.stampNumber}{' '}
                                                    stamps
                                                </p>
                                                {perk.details && (
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {perk.details}
                                                    </p>
                                                )}
                                            </div>
                                            {totalStamps >=
                                                perk.stampNumber && (
                                                <Badge className="flex-shrink-0 bg-green-500 text-xs text-white hover:bg-green-600">
                                                    Unlocked!
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── PERKS TAB ── */}
                {activeTab === 'perks' && (
                    <div className="space-y-4 px-4 py-4 sm:px-0">
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-gray-900">
                                My Rewards
                            </h2>
                            <p className="text-sm text-gray-400">
                                View and manage your unlocked rewards
                            </p>
                        </div>
                        {perkClaims.length > 0 ? (
                            perkClaims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className="rounded-2xl bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {claim.loyalty_card.logo ? (
                                                <img
                                                    src={`/${claim.loyalty_card.logo}`}
                                                    alt={
                                                        claim.loyalty_card.name
                                                    }
                                                    className="h-12 w-12 rounded-full border-2 border-gray-100 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                    <Award className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        {claim.perk.reward}
                                                    </h3>
                                                    <p className="text-xs text-gray-400">
                                                        {
                                                            claim.loyalty_card
                                                                .name
                                                        }
                                                    </p>
                                                </div>
                                                {claim.is_redeemed ? (
                                                    <Badge className="border-0 bg-gray-200 text-xs text-gray-600 hover:bg-gray-200">
                                                        Redeemed
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-500 text-xs text-white hover:bg-green-600">
                                                        Available
                                                    </Badge>
                                                )}
                                            </div>
                                            {claim.perk.details && (
                                                <p className="mb-2 text-xs text-gray-600">
                                                    {claim.perk.details}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(
                                                        claim.created_at,
                                                    )}
                                                </span>
                                                {claim.is_redeemed &&
                                                    claim.redeemed_at && (
                                                        <span className="flex items-center gap-1">
                                                            <Trophy className="h-3 w-3" />
                                                            Redeemed{' '}
                                                            {formatDate(
                                                                claim.redeemed_at,
                                                            )}
                                                        </span>
                                                    )}
                                            </div>
                                            {claim.remarks && (
                                                <div className="mt-2 rounded-lg bg-blue-50 p-2">
                                                    <p className="text-xs text-blue-800">
                                                        <span className="font-semibold">
                                                            Note:
                                                        </span>{' '}
                                                        {claim.remarks}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                                <Award className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                                <h3 className="mb-1 font-bold text-gray-900">
                                    No Rewards Yet
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Keep collecting stamps to unlock rewards!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── HISTORY TAB ── */}
                {activeTab === 'history' && (
                    <div className="space-y-4 px-4 py-4 sm:px-0">
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-gray-900">
                                Completed Cards
                            </h2>
                            <p className="text-sm text-gray-400">
                                {completedCards.length} cards completed
                            </p>
                        </div>
                        {completedCards.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {completedCards.map((completed) => (
                                    <CompletedCardPreview
                                        key={completed.id}
                                        completed={completed}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                                <Trophy className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                                <h3 className="mb-1 font-bold text-gray-900">
                                    No Completed Cards Yet
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Complete your first card to see it here!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ACCOUNT TAB (mobile only, replaces dropdown) ── */}
                {activeTab === 'account' && (
                    <div className="space-y-3 px-4 py-4">
                        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">
                                    {customerName}
                                </p>
                                <p className="text-sm text-gray-400">
                                    @{customer.username}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setProfileDialogOpen(true)}
                            className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                    <Settings className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Edit Profile
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => router.post('/customer/logout')}
                            className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm active:bg-red-50"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                                <X className="h-4 w-4 text-red-500" />
                            </div>
                            <span className="text-sm font-semibold text-red-500">
                                Logout
                            </span>
                        </button>
                    </div>
                )}
            </main>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-white px-2 sm:hidden">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-1 flex-col items-center gap-0.5 px-3 py-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}
                            >
                                <div
                                    className={`relative rounded-xl p-1.5 transition-all ${isActive ? 'bg-primary/10' : ''}`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                                    />
                                    {item.id === 'perks' &&
                                        perkClaims.filter((p) => !p.is_redeemed)
                                            .length > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                                {
                                                    perkClaims.filter(
                                                        (p) => !p.is_redeemed,
                                                    ).length
                                                }
                                            </span>
                                        )}
                                    {item.id === 'history' &&
                                        completedCards.length > 0 &&
                                        !isActive && (
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                                        )}
                                </div>
                                <span
                                    className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-gray-400'}`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* ── DIALOGS ── */}
            <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Stamp</DialogTitle>
                        <DialogDescription>
                            Choose how you want to record your stamp
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            onClick={handleScanQR}
                            className="flex h-32 flex-col gap-3"
                            variant="outline"
                        >
                            <Camera className="h-8 w-8" />
                            <span>Scan QR Code</span>
                        </Button>
                        <Button
                            onClick={handleManualEntry}
                            className="flex h-32 flex-col gap-3"
                            variant="outline"
                        >
                            <Type className="h-8 w-8" />
                            <span>Enter Manually</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Stamp Code</DialogTitle>
                        <DialogDescription>
                            Enter the code provided by the business
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Stamp Code</Label>
                                <Input
                                    id="code"
                                    placeholder="Enter code here"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    className="uppercase"
                                    required
                                />
                                {errors.code && (
                                    <div className="text-xs text-destructive">
                                        {errors.code}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRecordDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitCode}
                                disabled={processing}
                            >
                                {processing ? 'Recording...' : 'Record Stamp'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={scanDialogOpen}
                onOpenChange={(open) => {
                    if (!open) stopCamera();
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                            Position the QR code within the frame
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover"
                            />
                            {scanning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative h-56 w-56">
                                        <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-4 border-l-4 border-green-400" />
                                        <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-4 border-r-4 border-green-400" />
                                        <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-green-400" />
                                        <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-4 border-b-4 border-green-400" />
                                    </div>
                                    <div className="absolute right-0 bottom-5 left-0 text-center">
                                        <p className="inline-block rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur">
                                            Scanning...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={stopCamera}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!selectedCompletedCard}
                onOpenChange={() => setSelectedCompletedCard(null)}
            >
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />{' '}
                            Completed Card Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedCompletedCard && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4">
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Loyalty Card
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {
                                            selectedCompletedCard.loyalty_card_name
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Cycle Number
                                    </p>
                                    <p className="text-sm font-semibold">
                                        #{selectedCompletedCard.card_cycle}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Stamps Collected
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {selectedCompletedCard.stamps_collected}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Completed On
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {formatCompletedDate(
                                            selectedCompletedCard.completed_at,
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-2 text-sm font-semibold">
                                    Stamp History
                                </h4>
                                <div className="max-h-60 space-y-2 overflow-y-auto">
                                    {completedCardStamps(
                                        selectedCompletedCard,
                                    ).map((stamp, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-xs"
                                        >
                                            <span className="font-mono text-gray-600">
                                                {stamp.code}
                                            </span>
                                            <span className="text-gray-400">
                                                {formatDate(stamp.used_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
