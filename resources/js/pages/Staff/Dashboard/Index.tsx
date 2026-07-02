import { Head, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import LOGO from "../../../../images/mainLogo.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Award, Eye, Check, Undo2, Calendar, User, Sparkles, QrCode, Ticket, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { BrowserQRCodeReader } from "@zxing/browser";

interface LoyaltyCard {
  id: number;
  name: string;
  logo?: string;
}

interface PerkClaim {
  id: number;
  customer_id: number;
  loyalty_card_id: number;
  perk_id: number;
  stamps_at_claim: number;
  is_redeemed: boolean;
  redeemed_at: string | null;
  remarks: string | null;
  created_at: string;
  customer: {
    id: number;
    username: string;
    email: string;
  };
  perk: {
    id: number;
    reward: string;
    details: string | null;
    stampNumber: number;
  };
  loyalty_card: {
    id: number;
    name: string;
    logo: string | null;
  };
  redeemed_by?: {
    id: number;
    username: string;
  };
}

interface StampCodeRecord {
  id: number;
  code: string;
  customer: {
    username: string;
    email: string;
  } | null;
  used_at: string | null;
  is_expired: boolean;
  number_of_stamps: number;
  created_at: string;
  loyalty_card: {
    name: string;
  };
}

interface Props {
  code?: {
    success: boolean;
    code: string;
    qr_url: string;
    created_at: string;
    number_of_stamps?: number;
  };
  cards?: LoyaltyCard[];
  loyalty_card_id?: string;
  perkClaims?: PerkClaim[];
  stampCodes?: StampCodeRecord[];
  stats?: {
    total: number;
    available: number;
    redeemed: number;
  };
}

type ScanControls = {
  stop: () => void;
};

export default function Index({ code, cards = [], loyalty_card_id, perkClaims = [], stampCodes = [], stats }: Props) {
  const [loading, setLoading] = useState(false);
  const [downloadingOffline, setDownloadingOffline] = useState(false);
  const [scanCustomerOpen, setScanCustomerOpen] = useState(false);
  const [scanningCustomer, setScanningCustomer] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>(
    loyalty_card_id?.toString() || (cards.length > 0 ? cards[0].id.toString() : "")
  );
  const [numberOfStamps, setNumberOfStamps] = useState<number>(1);
  const [numberOfStampsError, setNumberOfStampsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scanVideoRef = useRef<HTMLVideoElement>(null);
  const scanControlsRef = useRef<ScanControls | null>(null);
  const customerScanSubmittedRef = useRef(false);
  
  // Perk Claims state
  const [selectedClaim, setSelectedClaim] = useState<PerkClaim | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);
  const [perkSearch, setPerkSearch] = useState("");
  
  // Stamp Codes state
  const [codeSearch, setCodeSearch] = useState("");
  const [activeTab, setActiveTab] = useState("issue-stamp");

  const generateCode = () => {
    if (!selectedCardId) {
      setError("Please select a loyalty card");
      return;
    }
    if (numberOfStamps < 1) {
      setNumberOfStampsError("Please enter a valid number of stamps");
      return;
    }

    setLoading(true);
    setError(null);
    setNumberOfStampsError(null);
    router.get('/staff/dashboard', { loyalty_card_id: selectedCardId, number_of_stamps: numberOfStamps });
    setLoading(false);
  };

  const generateNewCode = () => {
    if (!selectedCardId) {
      setError("Please select a loyalty card");
      return;
    }
    if (numberOfStamps < 1) {
      setNumberOfStampsError("Please enter a valid number of stamps");
      return;
    }

    setLoading(true);
    setError(null);
    setNumberOfStampsError(null);
    router.get('/staff/dashboard', { loyalty_card_id: selectedCardId, number_of_stamps: numberOfStamps });
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

  const scanCustomerQr = async () => {
    if (!selectedCardId) {
      setError("Please select a loyalty card");
      return;
    }
    if (numberOfStamps < 1) {
      setNumberOfStampsError("Please enter a valid number of stamps");
      return;
    }

    setError(null);
    setNumberOfStampsError(null);
    customerScanSubmittedRef.current = false;
    setScanCustomerOpen(true);
    setScanningCustomer(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const codeReader = new BrowserQRCodeReader();
      if (!scanVideoRef.current) throw new Error("Video element not ready");

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) throw new Error("No camera devices found");

      const backCamera = videoInputDevices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("environment"),
      );
      const selectedDeviceId =
        backCamera?.deviceId || videoInputDevices[videoInputDevices.length - 1]?.deviceId;

      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        scanVideoRef.current,
        (result, _error, controls) => {
          scanControlsRef.current = controls;
          if (!result || customerScanSubmittedRef.current) return;

          customerScanSubmittedRef.current = true;

          router.post(
            "/staff/scan-customer",
            {
              customer_qr: result.getText(),
              loyalty_card_id: selectedCardId,
              number_of_stamps: numberOfStamps,
            },
            {
              preserveScroll: true,
              onSuccess: () => {
                toast.success("Stamp issued successfully. Ask the customer to refresh their phone.");
                stopCustomerScanner();
              },
              onError: (errors) => {
                toast.error(
                  errors.customer_qr ||
                    errors.loyalty_card_id ||
                    errors.number_of_stamps ||
                    "Failed to issue stamp. Please try again.",
                );
                customerScanSubmittedRef.current = false;
                stopCustomerScanner();
              },
              onFinish: stopCustomerScanner,
            },
          );
        },
      );

      scanControlsRef.current = controls;
    } catch (err) {
      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "NotAllowedError") toast.error("Camera permission denied.");
      else if (errorName === "NotFoundError") toast.error("No camera found.");
      else if (errorName === "NotReadableError") toast.error("Camera is already in use.");
      else toast.error("Failed to access camera.");
      stopCustomerScanner();
    }
  };

  useEffect(() => {
    return () => {
      stopCustomerScanner();
    };
  }, []);

  const downloadOfflineStamps = async () => {
    setDownloadingOffline(true);
    setError(null);
    try {
      const response = await fetch(`/staff/generate-offline?id=${selectedCardId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' },
      });
      if (!response.ok) throw new Error('Failed to generate offline stamps');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loyalty-stamps-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download offline stamps. Please try again.');
      console.error('Download error:', err);
    } finally {
      setDownloadingOffline(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (claim: PerkClaim) => {
    setSelectedClaim(claim);
    setDetailDialogOpen(true);
  };

  const handleRedeemClick = (claim: PerkClaim) => {
    setSelectedClaim(claim);
    setRemarks("");
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
          setRemarks("");
          setSelectedClaim(null);
        },
        onError: () => {
          toast.error('Failed to mark perk as redeemed.');
        },
        onFinish: () => {
          setProcessing(false);
        }
      }
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
        }
      }
    );
  };

  const handleLogout = () => {
    router.post('/staff/logout');
  };

  const getStatusBadge = (stampCode: StampCodeRecord) => {
    if (stampCode.is_expired) {
      return <Badge className="bg-red-500 text-white">Expired</Badge>;
    }
    if (stampCode.used_at) {
      return <Badge className="bg-green-500 text-white">Used</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const filteredPerkClaims = perkClaims.filter(claim => 
    claim.customer.username.toLowerCase().includes(perkSearch.toLowerCase()) ||
    claim.perk.reward.toLowerCase().includes(perkSearch.toLowerCase()) ||
    claim.loyalty_card.name.toLowerCase().includes(perkSearch.toLowerCase())
  );

  const filteredStampCodes = stampCodes.filter(code => 
    code.code.toLowerCase().includes(codeSearch.toLowerCase()) ||
    code.customer?.username.toLowerCase().includes(codeSearch.toLowerCase()) ||
    code.loyalty_card.name.toLowerCase().includes(codeSearch.toLowerCase())
  );

  return (
    <>
      <Head title="Staff Dashboard" />
      <Dialog
        open={scanCustomerOpen}
        onOpenChange={(open) => {
          if (!open) stopCustomerScanner();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan Customer QR</DialogTitle>
            <DialogDescription>
              Ask the customer to show their personal QR from their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
              <video
                ref={scanVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {scanningCustomer && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56">
                    <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-4 border-l-4 border-green-400" />
                    <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-4 border-r-4 border-green-400" />
                    <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-green-400" />
                    <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-4 border-b-4 border-green-400" />
                  </div>
                  <div className="absolute right-0 bottom-5 left-0 text-center">
                    <p className="inline-block rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur">
                      Scanning customer QR...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={stopCustomerScanner}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="min-h-screen bg-white">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div >
                 <img src={LOGO} alt="business logo" className='h-12'/>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h2>
            <p className="text-gray-600">Manage customer loyalty and rewards</p>
          </div>

          {/* Stats Cards */}
          <div className="md:grid hidden grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm font-medium">Total Claims</p>
                    <p className="text-4xl font-bold mt-2">{stats?.total || 0}</p>
                  </div>
                  <Award className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className=" shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm font-medium">Available</p>
                    <p className="text-4xl font-bold mt-2">{stats?.available || 0}</p>
                  </div>
                  <Sparkles className="w-12 h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm font-medium">Redeemed</p>
                    <p className="text-4xl font-bold mt-2">{stats?.redeemed || 0}</p>
                  </div>
                  <Check className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm p-1">
              <TabsTrigger value="issue-stamp" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Issue Stamp</span>
              </TabsTrigger>
              <TabsTrigger value="perk-claims" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Perk Claims</span>
              </TabsTrigger>
              <TabsTrigger value="stamp-codes" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Stamp Codes</span>
              </TabsTrigger>
            </TabsList>

            {/* ISSUE STAMP TAB */}
            <TabsContent value="issue-stamp" className="space-y-6">
              {!code?.success ? (
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Generate New Stamp Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="loyalty-card" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Select Loyalty Card
                      </Label>
                      {cards.length > 0 ? (
                        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                          <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder="Select a loyalty card" />
                          </SelectTrigger>
                          <SelectContent>
                            {cards.map((card) => (
                              <SelectItem key={card.id} value={card.id.toString()}>
                                {card.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                          No loyalty cards available. Contact administrator.
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="number-of-stamps" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Number of Stamps
                      </Label>
                      <Input
                        id="number-of-stamps"
                        type="number"
                        min="1"
                        value={numberOfStamps}
                        onChange={(event) => setNumberOfStamps(parseInt(event.target.value) || 0)}
                        className="h-12"
                      />
                      {numberOfStampsError && (
                        <p className="mt-1 text-sm text-red-600">{numberOfStampsError}</p>
                      )}
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                        <span className="font-semibold">Error:</span> {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={generateCode}
                        disabled={loading || cards.length === 0}
                        className="h-12 bg-primary"
                      >
                        <QrCode className="w-5 h-5 mr-2" />
                        {loading ? "Generating..." : "Generate Code"}
                      </Button>

                      <Button
                        onClick={scanCustomerQr}
                        disabled={cards.length === 0}
                        variant="outline"
                        className="h-12 border-2"
                      >
                        <QrCode className="w-5 h-5 mr-2" />
                        Scan Customer QR
                      </Button>

                      <Button
                        onClick={downloadOfflineStamps}
                        disabled={downloadingOffline || cards.length === 0}
                        variant="outline"
                        className="h-12 border-2"
                      >
                        <Ticket className="w-5 h-5 mr-2" />
                        {downloadingOffline ? "Generating..." : "Download 8 Tickets"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>Code Generated Successfully! 🎉</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">Generated on {code?.created_at}</p>
                          {code?.number_of_stamps && (
                            <p className="text-sm font-semibold text-gray-700 mt-1">
                              Number of Stamps: {code.number_of_stamps}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex flex-col items-center">
                        <img src={code?.qr_url} alt="QR Code" className="w-72 h-72 rounded-lg shadow-lg" />
                        <div className="mt-6 text-center">
                          <p className="text-sm text-gray-600 mb-2">Or enter manually:</p>
                          <div className="bg-gray-100 px-8 py-4 rounded-lg inline-block">
                            <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{code?.code}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Important</p>
                      <p className="text-sm text-yellow-700">Code expires in 15 minutes if unused.</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Generate Another Code
                      </Label>
                      <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((card) => (
                            <SelectItem key={card.id} value={card.id.toString()}>
                              {card.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="number-of-stamps-new" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Number of Stamps
                      </Label>
                      <Input
                        id="number-of-stamps-new"
                        type="number"
                        min="1"
                        value={numberOfStamps}
                        onChange={(event) => setNumberOfStamps(parseInt(event.target.value) || 0)}
                        className="h-12"
                      />
                      {numberOfStampsError && (
                        <p className="mt-1 text-sm text-red-600">{numberOfStampsError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button onClick={generateNewCode} className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <QrCode className="w-5 h-5 mr-2" />
                        Generate New
                      </Button>
                      <Button onClick={scanCustomerQr} disabled={cards.length === 0} variant="outline" className="h-12 border-2">
                        <QrCode className="w-5 h-5 mr-2" />
                        Scan Customer QR
                      </Button>
                      <Button onClick={downloadOfflineStamps} disabled={downloadingOffline} variant="outline" className="h-12 border-2">
                        <Ticket className="w-5 h-5 mr-2" />
                        Download Tickets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* PERK CLAIMS TAB */}
            <TabsContent value="perk-claims" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Customer Perk Claims
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search by customer, reward, or card..."
                      value={perkSearch}
                      onChange={(e) => setPerkSearch(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold">Reward</TableHead>
                          <TableHead className="font-semibold">Card</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPerkClaims.length > 0 ? (
                          filteredPerkClaims.map((claim) => (
                            <TableRow key={claim.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="font-medium">{claim.customer.username}</div>
                                <div className="text-xs text-gray-500">{claim.customer.email}</div>
                              </TableCell>
                              <TableCell className="font-medium">{claim.perk.reward}</TableCell>
                              <TableCell>{claim.loyalty_card.name}</TableCell>
                              <TableCell>
                                {claim.is_redeemed ? (
                                  <Badge className="bg-gray-500">Redeemed</Badge>
                                ) : (
                                  <Badge className="bg-green-500">Available</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(claim)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {!claim.is_redeemed ? (
                                    <Button size="sm" onClick={() => handleRedeemClick(claim)} className="bg-green-600 hover:bg-green-700">
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleUndoRedeem(claim)}>
                                      <Undo2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                              <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>No perk claims found.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredPerkClaims.length > 0 ? (
                      filteredPerkClaims.map((claim) => (
                        <Card key={claim.id} className="shadow-md">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-base">{claim.customer.username}</p>
                                <p className="text-xs text-gray-500">{claim.customer.email}</p>
                              </div>
                              {claim.is_redeemed ? (
                                <Badge className="bg-gray-500">Redeemed</Badge>
                              ) : (
                                <Badge className="bg-green-500">Available</Badge>
                              )}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{claim.perk.reward}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-gray-400" />
                                <span>{claim.loyalty_card.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-gray-400" />
                                <span>{claim.stamps_at_claim} stamps</span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(claim)}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                              {!claim.is_redeemed ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleRedeemClick(claim)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Redeem
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUndoRedeem(claim)}
                                  className="flex-1"
                                >
                                  <Undo2 className="w-4 h-4 mr-1" />
                                  Undo
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No perk claims found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* STAMP CODES TAB */}
            <TabsContent value="stamp-codes" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Stamp Code History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search stamp codes or customers..."
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Card</TableHead>
                          <TableHead className="font-semibold">Code</TableHead>
                          <TableHead className="font-semibold">Stamps</TableHead>
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStampCodes.length > 0 ? (
                          filteredStampCodes.map((stampCode) => (
                            <TableRow key={stampCode.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{stampCode.loyalty_card.name}</TableCell>
                              <TableCell className="font-mono text-sm">{stampCode.code}</TableCell>
                              <TableCell>{stampCode.number_of_stamps}</TableCell>
                              <TableCell>
                                {stampCode.customer ? (
                                  <div>
                                    <div className="font-medium">{stampCode.customer.username}</div>
                                    <div className="text-xs text-gray-500">{stampCode.customer.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(stampCode)}</TableCell>
                              <TableCell className="text-sm">{formatDate(stampCode.created_at)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                              <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>No stamp codes found.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredStampCodes.length > 0 ? (
                      filteredStampCodes.map((stampCode) => (
                        <Card key={stampCode.id} className="shadow-md">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-mono font-semibold text-base">{stampCode.code}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {stampCode.loyalty_card.name} • {stampCode.number_of_stamps} {stampCode.number_of_stamps === 1 ? "stamp" : "stamps"}
                                </p>
                              </div>
                              {getStatusBadge(stampCode)}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              {stampCode.customer ? (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{stampCode.customer.username}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 ml-6">{stampCode.customer.email}</p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-400">Unassigned</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(stampCode.created_at)}</span>
                              </div>
                              
                              {stampCode.used_at && (
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-gray-400" />
                                  <span>Used: {formatDate(stampCode.used_at)}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No stamp codes found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Redeemed</DialogTitle>
            <DialogDescription>Confirm that this perk has been redeemed by the customer.</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedClaim.customer.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reward:</span>
                  <span className="font-medium">{selectedClaim.perk.reward}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)} disabled={processing}>Cancel</Button>
            <Button onClick={handleMarkAsRedeemed} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? 'Processing...' : 'Mark as Redeemed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Perk Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Customer</p>
                  <p className="font-semibold text-lg">{selectedClaim.customer.username}</p>
                  <p className="text-sm text-gray-500">{selectedClaim.customer.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  {selectedClaim.is_redeemed ? (
                    <Badge className="bg-gray-500 mt-1">Redeemed</Badge>
                  ) : (
                    <Badge className="bg-green-500 mt-1">Available</Badge>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-1">REWARD</p>
                <p className="font-semibold text-lg text-gray-900">{selectedClaim.perk.reward}</p>
                {selectedClaim.perk.details && (
                  <p className="text-sm text-gray-600 mt-1">{selectedClaim.perk.details}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Loyalty Card</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedClaim.loyalty_card.logo && (
                    <img 
                      src={`/${selectedClaim.loyalty_card.logo}`}
                      alt={selectedClaim.loyalty_card.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <span className="font-semibold">{selectedClaim.loyalty_card.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Stamps at Claim</p>
                  <p className="font-semibold text-2xl">{selectedClaim.stamps_at_claim}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Claimed At</p>
                  <p className="font-semibold text-sm">{formatDate(selectedClaim.created_at)}</p>
                </div>
              </div>

              {selectedClaim.is_redeemed && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Redeemed At</p>
                      <p className="font-semibold text-sm">
                        {selectedClaim.redeemed_at ? formatDate(selectedClaim.redeemed_at) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Redeemed By</p>
                      <p className="font-semibold text-sm">
                        {selectedClaim.redeemed_by?.username || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {selectedClaim.remarks && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-semibold mb-1">REMARKS</p>
                      <p className="text-sm text-gray-700">{selectedClaim.remarks}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
