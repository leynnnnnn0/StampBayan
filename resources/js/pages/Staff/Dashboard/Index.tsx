import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, router } from '@inertiajs/react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Award, Gift, History, Home, LogOut, Menu, QrCode, Ticket, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import LOGO from '../../../../images/mainLogo.png';
import {
  AccountTab,
  IssueStampTab,
  PerkClaimsTab,
  ScanCustomerDialog,
  StaffBottomNav,
  StaffDialogs,
  StaffStatsCards,
  StampCodesTab,
} from './components';
import type {
  GeneratedStampCode,
  LoyaltyCard,
  PaginatedList,
  PerkClaim,
  StaffDashboardTab,
  StaffNavItem,
  StaffStats,
  StampCodeRecord,
} from './types';

const STAFF_DASHBOARD_STATE_KEY = 'stampbayan_staff_dashboard_state';
const STAFF_DASHBOARD_TABS: StaffDashboardTab[] = ['issue-stamp', 'perk-claims', 'stamp-codes', 'account'];

interface Props {
  code?: GeneratedStampCode;
  cards?: LoyaltyCard[];
  loyalty_card_id?: string;
  perkClaims?: PaginatedList<PerkClaim>;
  stampCodes?: PaginatedList<StampCodeRecord>;
  stats?: StaffStats;
  filters?: {
    perk_search?: string;
    history_search?: string;
  };
}

const emptyPaginatedList = <T,>(): PaginatedList<T> => ({
  data: [],
  links: [],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
});

type ScanControls = {
  stop: () => void;
};

function readSavedStaffDashboardTab(): StaffDashboardTab {
  if (typeof window === 'undefined') return 'issue-stamp';

  try {
    const url = new URL(window.location.href);
    const tabFromUrl = url.searchParams.get('tab') as StaffDashboardTab | null;

    if (tabFromUrl && STAFF_DASHBOARD_TABS.includes(tabFromUrl)) {
      return tabFromUrl;
    }

    const saved = JSON.parse(window.localStorage.getItem(STAFF_DASHBOARD_STATE_KEY) || '{}') as {
      activeTab?: StaffDashboardTab;
    };

    return saved.activeTab && STAFF_DASHBOARD_TABS.includes(saved.activeTab) ? saved.activeTab : 'issue-stamp';
  } catch {
    return 'issue-stamp';
  }
}

export default function Index({
  code,
  cards = [],
  loyalty_card_id,
  perkClaims = emptyPaginatedList<PerkClaim>(),
  stampCodes = emptyPaginatedList<StampCodeRecord>(),
  stats,
  filters = {},
}: Props) {
  const [loading, setLoading] = useState(false);
  const [downloadingOffline, setDownloadingOffline] = useState(false);
  const [scanCustomerOpen, setScanCustomerOpen] = useState(false);
  const [scanningCustomer, setScanningCustomer] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>(
    loyalty_card_id?.toString() || (cards.length > 0 ? cards[0].id.toString() : ''),
  );
  const [numberOfStamps, setNumberOfStamps] = useState<number>(1);
  const [numberOfStampsError, setNumberOfStampsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<PerkClaim | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [perkSearch, setPerkSearch] = useState(filters.perk_search || '');
  const [codeSearch, setCodeSearch] = useState(filters.history_search || '');
  const [activeTab, setActiveTab] = useState<StaffDashboardTab>(readSavedStaffDashboardTab);
  const scanVideoRef = useRef<HTMLVideoElement>(null);
  const scanControlsRef = useRef<ScanControls | null>(null);
  const customerScanSubmittedRef = useRef(false);
  const perkSearchInitializedRef = useRef(false);
  const codeSearchInitializedRef = useRef(false);

  const navItems: StaffNavItem[] = useMemo(
    () => [
      { id: 'issue-stamp', label: 'Issue', icon: Home },
      {
        id: 'perk-claims',
        label: 'Rewards',
        icon: Gift,
        badge: stats?.available || undefined,
      },
      { id: 'stamp-codes', label: 'History', icon: History, dot: stampCodes.total > 0 },
      { id: 'account', label: 'Account', icon: User },
    ],
    [stampCodes.total, stats?.available],
  );

  useEffect(() => {
    if (!perkSearchInitializedRef.current) {
      perkSearchInitializedRef.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('loyalty_card_id');
      url.searchParams.delete('number_of_stamps');
      url.searchParams.delete('rewards_page');
      url.searchParams.set('tab', 'perk-claims');

      if (perkSearch.trim()) url.searchParams.set('perk_search', perkSearch.trim());
      else url.searchParams.delete('perk_search');

      router.get(url.toString(), {}, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ['perkClaims', 'filters'],
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [perkSearch]);

  useEffect(() => {
    if (!codeSearchInitializedRef.current) {
      codeSearchInitializedRef.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('loyalty_card_id');
      url.searchParams.delete('number_of_stamps');
      url.searchParams.delete('history_page');
      url.searchParams.set('tab', 'stamp-codes');

      if (codeSearch.trim()) url.searchParams.set('history_search', codeSearch.trim());
      else url.searchParams.delete('history_search');

      router.get(url.toString(), {}, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ['stampCodes', 'filters'],
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [codeSearch]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STAFF_DASHBOARD_STATE_KEY, JSON.stringify({ activeTab }));

      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
    } catch {
      // UI state persistence is best-effort.
    }
  }, [activeTab]);

  const validateStampInputs = () => {
    if (!selectedCardId) {
      setError('Please select a loyalty card');
      return false;
    }

    if (numberOfStamps < 1) {
      setNumberOfStampsError('Please enter a valid number of stamps');
      return false;
    }

    setError(null);
    setNumberOfStampsError(null);
    return true;
  };

  const generateCode = () => {
    if (!validateStampInputs()) return;

    setLoading(true);
    router.get('/staff/dashboard', {
      loyalty_card_id: selectedCardId,
      number_of_stamps: numberOfStamps,
      tab: activeTab,
    });
    setLoading(false);
  };

  const stopCustomerScanner = () => {
    if (scanControlsRef.current) {
      try {
        scanControlsRef.current.stop();
      } catch {
        scanControlsRef.current = null;
      }
      scanControlsRef.current = null;
    }

    if (scanVideoRef.current?.srcObject) {
      const stream = scanVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      scanVideoRef.current.srcObject = null;
    }

    setScanningCustomer(false);
    setScanCustomerOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCustomerScanner();
    };
  }, []);

  const scanCustomerQr = async () => {
    if (!validateStampInputs()) return;

    customerScanSubmittedRef.current = false;
    setScanCustomerOpen(true);
    setScanningCustomer(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const codeReader = new BrowserQRCodeReader();
      if (!scanVideoRef.current) throw new Error('Video element not ready');

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) throw new Error('No camera devices found');

      const backCamera = videoInputDevices.find(
        (device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment'),
      );
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[videoInputDevices.length - 1]?.deviceId;

      const controls = await codeReader.decodeFromVideoDevice(selectedDeviceId, scanVideoRef.current, (result, _error, controls) => {
        scanControlsRef.current = controls;
        if (!result || customerScanSubmittedRef.current) return;

        customerScanSubmittedRef.current = true;

        router.post(
          '/staff/scan-customer',
          {
            customer_qr: result.getText(),
            loyalty_card_id: selectedCardId,
            number_of_stamps: numberOfStamps,
          },
          {
            preserveScroll: true,
            onSuccess: () => {
              toast.success('Stamp issued successfully. Ask the customer to refresh their phone.');
              stopCustomerScanner();
            },
            onError: (errors) => {
              toast.error(
                errors.customer_qr ||
                  errors.loyalty_card_id ||
                  errors.number_of_stamps ||
                  'Failed to issue stamp. Please try again.',
              );
              customerScanSubmittedRef.current = false;
              stopCustomerScanner();
            },
            onFinish: stopCustomerScanner,
          },
        );
      });

      scanControlsRef.current = controls;
    } catch (err) {
      const errorName = err instanceof Error ? err.name : '';
      if (errorName === 'NotAllowedError') toast.error('Camera permission denied.');
      else if (errorName === 'NotFoundError') toast.error('No camera found.');
      else if (errorName === 'NotReadableError') toast.error('Camera is already in use.');
      else toast.error('Failed to access camera.');
      stopCustomerScanner();
    }
  };

  const downloadOfflineStamps = async () => {
    setDownloadingOffline(true);
    setError(null);

    try {
      const response = await fetch(`/staff/generate-offline?id=${selectedCardId}`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' },
      });
      if (!response.ok) throw new Error('Failed to generate offline stamps');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `loyalty-stamps-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download offline stamps. Please try again.');
      console.error('Download error:', err);
    } finally {
      setDownloadingOffline(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (claim: PerkClaim) => {
    setSelectedClaim(claim);
    setDetailDialogOpen(true);
  };

  const handleRedeemClick = (claim: PerkClaim) => {
    setSelectedClaim(claim);
    setRemarks('');
    setRedeemDialogOpen(true);
  };

  const handleMarkAsRedeemed = () => {
    if (!selectedClaim) return;

    setProcessing(true);
    router.post(
      `/staff/perk-claims/${selectedClaim.id}/redeem`,
      { remarks },
      {
        onSuccess: () => {
          toast.success('Perk marked as redeemed successfully!');
          setRedeemDialogOpen(false);
          setRemarks('');
          setSelectedClaim(null);
        },
        onError: () => {
          toast.error('Failed to mark perk as redeemed.');
        },
        onFinish: () => {
          setProcessing(false);
        },
      },
    );
  };

  const handleUndoRedeem = (claim: PerkClaim) => {
    if (!confirm('Are you sure you want to undo this redemption?')) return;

    router.post(
      `/staff/perk-claims/${claim.id}/undo`,
      {},
      {
        onSuccess: () => {
          toast.success('Redemption undone successfully!');
        },
        onError: () => {
          toast.error('Failed to undo redemption.');
        },
      },
    );
  };

  const handleLogout = () => {
    router.post('/staff/logout');
  };

  const getStatusBadge = (stampCode: StampCodeRecord) => {
    if (stampCode.is_expired) return <Badge className="bg-red-500 text-white">Expired</Badge>;
    if (stampCode.used_at) return <Badge className="bg-green-500 text-white">Used</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <>
      <Head title="Staff Dashboard" />
      <ScanCustomerDialog open={scanCustomerOpen} scanning={scanningCustomer} videoRef={scanVideoRef} onClose={stopCustomerScanner} />

      <div className="min-h-screen bg-white pb-20 sm:pb-0">
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between sm:h-16">
              <img src={LOGO} alt="StampBayan" className="h-9 sm:h-12" />

              <div className="hidden items-center gap-4 md:flex">
                <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 hover:bg-gray-100 md:hidden">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white md:hidden">
              <div className="space-y-2 px-4 py-3">
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </nav>

        <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-5 sm:mb-8">
            <p className="text-sm font-semibold text-gray-400 sm:text-xl">Welcome back</p>
            <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">Staff Dashboard</h2>
            <p className="text-sm text-gray-600 sm:text-base">Manage customer loyalty and rewards</p>
          </div>

          <StaffStatsCards stats={stats} />

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StaffDashboardTab)} className="space-y-6">
            <TabsList className="hidden w-full grid-cols-4 bg-white p-1 shadow-sm sm:grid">
              <TabsTrigger value="issue-stamp" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <QrCode className="h-4 w-4" />
                Issue Stamp
              </TabsTrigger>
              <TabsTrigger value="perk-claims" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Award className="h-4 w-4" />
                Perk Claims
              </TabsTrigger>
              <TabsTrigger value="stamp-codes" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Ticket className="h-4 w-4" />
                Stamp Codes
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issue-stamp" className="space-y-6">
              <IssueStampTab
                code={code}
                cards={cards}
                selectedCardId={selectedCardId}
                numberOfStamps={numberOfStamps}
                numberOfStampsError={numberOfStampsError}
                error={error}
                loading={loading}
                downloadingOffline={downloadingOffline}
                onCardChange={setSelectedCardId}
                onStampCountChange={setNumberOfStamps}
                onGenerateCode={generateCode}
                onGenerateNewCode={generateCode}
                onScanCustomer={scanCustomerQr}
                onDownloadOffline={downloadOfflineStamps}
              />
            </TabsContent>

            <TabsContent value="perk-claims" className="space-y-6">
              <PerkClaimsTab
                claims={perkClaims.data}
                pagination={perkClaims}
                search={perkSearch}
                onSearchChange={setPerkSearch}
                onViewDetails={handleViewDetails}
                onRedeem={handleRedeemClick}
                onUndoRedeem={handleUndoRedeem}
              />
            </TabsContent>

            <TabsContent value="stamp-codes" className="space-y-6">
              <StampCodesTab
                codes={stampCodes.data}
                pagination={stampCodes}
                search={codeSearch}
                onSearchChange={setCodeSearch}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <AccountTab onLogout={handleLogout} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <StaffBottomNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />

      <StaffDialogs
        redeemDialogOpen={redeemDialogOpen}
        detailDialogOpen={detailDialogOpen}
        selectedClaim={selectedClaim}
        remarks={remarks}
        processing={processing}
        onRedeemDialogChange={setRedeemDialogOpen}
        onDetailDialogChange={setDetailDialogOpen}
        onRemarksChange={setRemarks}
        onMarkAsRedeemed={handleMarkAsRedeemed}
        formatDate={formatDate}
      />
    </>
  );
}
