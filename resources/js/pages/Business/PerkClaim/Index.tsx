import ModuleHeading from "@/components/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Search, Award, Eye, Check, Undo2, Calendar, User, Sparkles } from "lucide-react";
import Pagination from "@/components/pagination";
import { toast } from "sonner";

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Paginated<T> {
  data: T[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
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

interface Props {
  perkClaims: Paginated<PerkClaim>;
  filters: {
    search?: string;
    status?: string;
  };
  stats: {
    total: number;
    available: number;
    redeemed: number;
  };
}

export default function Index({ perkClaims, filters, stats }: Props) {
  const [search, setSearch] = useState(filters.search || "");
  const [selectedClaim, setSelectedClaim] = useState<PerkClaim | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      router.get(
        '/business/perk-claims',
        { search, status: filters.status },
        {
          preserveState: true,
          replace: true,
        }
      );
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, filters.status]);

  const handleStatusFilter = (status: string) => {
    router.get(
      '/business/perk-claims',
      { search, status },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  const formatDate = (dateString: string) => {
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
      `/business/perk-claims/${selectedClaim.id}/redeem`,
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
      `/business/perk-claims/${claim.id}/undo`,
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

  return (
    <AppLayout>
      <Head title="Perk Claims" />
      <ModuleHeading
        title="Perk Claims"
        description="View and manage customer perk claims."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card 
          className={`cursor-pointer transition-all ${!filters.status ? 'ring-2 ring-black' : ''}`}
          onClick={() => handleStatusFilter('')}
        >
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Award className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${filters.status === 'available' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => handleStatusFilter('available')}
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.available}</p>
              </div>
              <Sparkles className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${filters.status === 'redeemed' ? 'ring-2 ring-gray-500' : ''}`}
          onClick={() => handleStatusFilter('redeemed')}
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Redeemed</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">{stats.redeemed}</p>
              </div>
              <Check className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by customer, reward, or card..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Loyalty Card</TableHead>
                <TableHead>Stamps</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Claimed At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perkClaims.data.length > 0 ? (
                perkClaims.data.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.customer.username}</div>
                        <div className="text-xs text-gray-500">{claim.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.perk.reward}</div>
                        {claim.perk.details && (
                          <div className="text-xs text-gray-500">{claim.perk.details}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {claim.loyalty_card.logo && (
                          <img 
                            src={`/${claim.loyalty_card.logo}`}
                            alt={claim.loyalty_card.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span>{claim.loyalty_card.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{claim.stamps_at_claim}</TableCell>
                    <TableCell>
                      {claim.is_redeemed ? (
                        <Badge className="bg-gray-500 hover:bg-gray-600">
                          Redeemed
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Available
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(claim.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(claim)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!claim.is_redeemed ? (
                          <Button
                            size="sm"
                            onClick={() => handleRedeemClick(claim)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Redeem
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoRedeem(claim)}
                          >
                            <Undo2 className="w-4 h-4 mr-1" />
                            Undo
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No perk claims found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {perkClaims.data.length > 0 ? (
            perkClaims.data.map((claim) => (
              <Card key={claim.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {claim.loyalty_card.logo && (
                        <img 
                          src={`/${claim.loyalty_card.logo}`}
                          alt={claim.loyalty_card.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{claim.perk.reward}</div>
                        <div className="text-sm text-gray-600">{claim.loyalty_card.name}</div>
                      </div>
                    </div>
                    {claim.is_redeemed ? (
                      <Badge className="bg-gray-500">Redeemed</Badge>
                    ) : (
                      <Badge className="bg-green-500">Available</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{claim.customer.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Sparkles className="w-4 h-4" />
                      <span>{claim.stamps_at_claim} stamps</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(claim.created_at)}</span>
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
            <div className="border rounded-lg p-8 text-center text-gray-500">
              No perk claims found.
            </div>
          )}
        </div>

        {perkClaims.last_page > 1 && (
          <Pagination data={perkClaims} />
        )}
      </div>

      {/* Redeem Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Redeemed</DialogTitle>
            <DialogDescription>
              Confirm that this perk has been redeemed by the customer.
            </DialogDescription>
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
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Card:</span>
                  <span className="font-medium">{selectedClaim.loyalty_card.name}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any notes about this redemption..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRedeemDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsRedeemed}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Processing...' : 'Mark as Redeemed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Perk Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedClaim.customer.username}</p>
                  <p className="text-sm text-gray-500">{selectedClaim.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {selectedClaim.is_redeemed ? (
                    <Badge className="bg-gray-500 mt-1">Redeemed</Badge>
                  ) : (
                    <Badge className="bg-green-500 mt-1">Available</Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Reward</p>
                <p className="font-semibold">{selectedClaim.perk.reward}</p>
                {selectedClaim.perk.details && (
                  <p className="text-sm text-gray-600 mt-1">{selectedClaim.perk.details}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600">Loyalty Card</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedClaim.loyalty_card.logo && (
                    <img 
                      src={`/${selectedClaim.loyalty_card.logo}`}
                      alt={selectedClaim.loyalty_card.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="font-semibold">{selectedClaim.loyalty_card.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Stamps at Claim</p>
                  <p className="font-semibold">{selectedClaim.stamps_at_claim}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claimed At</p>
                  <p className="font-semibold text-sm">{formatDate(selectedClaim.created_at)}</p>
                </div>
              </div>

              {selectedClaim.is_redeemed && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Redeemed At</p>
                      <p className="font-semibold text-sm">
                        {selectedClaim.redeemed_at ? formatDate(selectedClaim.redeemed_at) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Redeemed By</p>
                      <p className="font-semibold text-sm">
                        {selectedClaim.redeemed_by?.username || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {selectedClaim.remarks && (
                    <div>
                      <p className="text-sm text-gray-600">Remarks</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                        {selectedClaim.remarks}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
