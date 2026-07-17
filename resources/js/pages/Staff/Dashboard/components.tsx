import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import Pagination from '@/components/pagination';
import {
  Award,
  Calendar,
  Check,
  Eye,
  LogOut,
  QrCode,
  Search,
  Sparkles,
  Ticket,
  Undo2,
  User,
} from 'lucide-react';
import type {
  GeneratedStampCode,
  LoyaltyCard,
  PaginatedList,
  PerkClaim,
  StaffNavItem,
  StaffStats,
  StampCodeRecord,
} from './types';

type ScanDialogProps = {
  open: boolean;
  scanning: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
};

export function ScanCustomerDialog({ open, scanning, videoRef, onClose }: ScanDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Scan Customer QR</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Ask the customer to show their personal QR from their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 sm:py-4">
          <div className="relative aspect-square max-h-[70vh] overflow-hidden rounded-xl bg-black sm:rounded-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-40 w-40 sm:h-56 sm:w-56">
                  <div className="absolute top-0 left-0 h-7 w-7 rounded-tl-lg border-t-4 border-l-4 border-green-400 sm:h-8 sm:w-8" />
                  <div className="absolute top-0 right-0 h-7 w-7 rounded-tr-lg border-t-4 border-r-4 border-green-400 sm:h-8 sm:w-8" />
                  <div className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-lg border-b-4 border-l-4 border-green-400 sm:h-8 sm:w-8" />
                  <div className="absolute right-0 bottom-0 h-7 w-7 rounded-br-lg border-r-4 border-b-4 border-green-400 sm:h-8 sm:w-8" />
                </div>
                <div className="absolute right-0 bottom-5 left-0 text-center">
                  <p className="inline-block rounded-full bg-black/60 px-3 py-1.5 text-[11px] text-white backdrop-blur sm:px-4 sm:py-2 sm:text-xs">
                    Scanning customer QR...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StaffStatsCards({ stats }: { stats?: StaffStats }) {
  return (
    <div className="mb-8 hidden grid-cols-1 gap-6 md:grid md:grid-cols-3">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Claims</p>
              <p className="mt-2 text-4xl font-bold">{stats?.total || 0}</p>
            </div>
            <Award className="h-12 w-12 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Available</p>
              <p className="mt-2 text-4xl font-bold">{stats?.available || 0}</p>
            </div>
            <Sparkles className="h-12 w-12 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Redeemed</p>
              <p className="mt-2 text-4xl font-bold">{stats?.redeemed || 0}</p>
            </div>
            <Check className="h-12 w-12 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type IssueStampTabProps = {
  code?: GeneratedStampCode;
  cards: LoyaltyCard[];
  selectedCardId: string;
  numberOfStamps: number;
  numberOfStampsError: string | null;
  error: string | null;
  loading: boolean;
  downloadingOffline: boolean;
  onCardChange: (value: string) => void;
  onStampCountChange: (value: number) => void;
  onGenerateCode: () => void;
  onGenerateNewCode: () => void;
  onScanCustomer: () => void;
  onDownloadOffline: () => void;
};

function StampControls({
  cards,
  selectedCardId,
  numberOfStamps,
  numberOfStampsError,
  onCardChange,
  onStampCountChange,
  cardLabel,
}: Pick<
  IssueStampTabProps,
  'cards' | 'selectedCardId' | 'numberOfStamps' | 'numberOfStampsError' | 'onCardChange' | 'onStampCountChange'
> & { cardLabel: string }) {
  return (
    <>
      <div>
        <Label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">{cardLabel}</Label>
        {cards.length > 0 ? (
          <Select value={selectedCardId} onValueChange={onCardChange}>
            <SelectTrigger className="h-11 w-full text-sm sm:h-12">
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
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700 sm:p-4 sm:text-sm">
            No loyalty cards available. Contact administrator.
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="number-of-stamps" className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
          Number of Stamps
        </Label>
        <Input
          id="number-of-stamps"
          type="number"
          min="1"
          value={numberOfStamps}
          onChange={(event) => onStampCountChange(parseInt(event.target.value) || 0)}
          className="h-11 text-sm sm:h-12"
        />
        {numberOfStampsError && <p className="mt-1 text-xs text-red-600 sm:text-sm">{numberOfStampsError}</p>}
      </div>
    </>
  );
}

export function IssueStampTab({
  code,
  cards,
  selectedCardId,
  numberOfStamps,
  numberOfStampsError,
  error,
  loading,
  downloadingOffline,
  onCardChange,
  onStampCountChange,
  onGenerateCode,
  onGenerateNewCode,
  onScanCustomer,
  onDownloadOffline,
}: IssueStampTabProps) {
  const hasGeneratedCode = !!code?.success;

  return (
    <Card className="gap-0 overflow-hidden border-0 py-0 shadow-lg">
      {hasGeneratedCode ? (
        <>
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 sm:h-12 sm:w-12">
                <Check className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base leading-tight sm:text-xl">Code Generated Successfully!</CardTitle>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">Generated on {code?.created_at}</p>
                {code?.number_of_stamps && (
                  <p className="mt-1 text-xs font-semibold text-gray-700 sm:text-sm">
                    Number of Stamps: {code.number_of_stamps}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div className="rounded-xl border border-gray-200 bg-white p-3 sm:border-2 sm:p-6">
              <div className="flex flex-col items-center">
                <img src={code?.qr_url} alt="QR Code" className="h-52 w-52 max-w-full rounded-lg shadow-lg sm:h-72 sm:w-72" />
                <div className="mt-4 w-full text-center sm:mt-6">
                  <p className="mb-2 text-xs text-gray-600 sm:text-sm">Or enter manually:</p>
                  <div className="inline-block max-w-full rounded-lg bg-gray-100 px-4 py-3 sm:px-8 sm:py-4">
                    <p className="break-all font-mono text-xl font-bold tracking-wider text-gray-900 sm:text-3xl">{code?.code}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
              <p className="mb-1 text-sm font-semibold text-yellow-800">Important</p>
              <p className="text-xs text-yellow-700 sm:text-sm">Code expires in 15 minutes if unused.</p>
            </div>

            <StampControls
              cards={cards}
              selectedCardId={selectedCardId}
              numberOfStamps={numberOfStamps}
              numberOfStampsError={numberOfStampsError}
              onCardChange={onCardChange}
              onStampCountChange={onStampCountChange}
              cardLabel="Generate Another Code"
            />

            <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
              <Button onClick={onGenerateNewCode} className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm sm:h-12">
                <QrCode className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">Generate New</span>
              </Button>
              <Button onClick={onScanCustomer} disabled={cards.length === 0} variant="outline" className="h-11 border text-sm sm:h-12 sm:border-2">
                <QrCode className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">Scan Customer QR</span>
              </Button>
              <Button onClick={onDownloadOffline} disabled={downloadingOffline} variant="outline" className="h-11 border text-sm sm:h-12 sm:border-2">
                <Ticket className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">Download Tickets</span>
              </Button>
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="px-4 py-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
              Issue Stamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
            <StampControls
              cards={cards}
              selectedCardId={selectedCardId}
              numberOfStamps={numberOfStamps}
              numberOfStampsError={numberOfStampsError}
              onCardChange={onCardChange}
              onStampCountChange={onStampCountChange}
              cardLabel="Select Loyalty Card"
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 sm:p-4 sm:text-sm">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
              <Button onClick={onGenerateCode} disabled={loading || cards.length === 0} className="h-11 bg-primary text-sm sm:h-12">
                <QrCode className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">{loading ? 'Generating...' : 'Generate Code'}</span>
              </Button>
              <Button onClick={onScanCustomer} disabled={cards.length === 0} variant="outline" className="h-11 border text-sm sm:h-12 sm:border-2">
                <QrCode className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">Scan Customer QR</span>
              </Button>
              <Button
                onClick={onDownloadOffline}
                disabled={downloadingOffline || cards.length === 0}
                variant="outline"
                className="h-11 border text-sm sm:h-12 sm:border-2"
              >
                <Ticket className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">{downloadingOffline ? 'Generating...' : 'Download 8 Tickets'}</span>
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

type PerkClaimsTabProps = {
  claims: PerkClaim[];
  pagination: PaginatedList<PerkClaim>;
  search: string;
  onSearchChange: (value: string) => void;
  onViewDetails: (claim: PerkClaim) => void;
  onRedeem: (claim: PerkClaim) => void;
  onUndoRedeem: (claim: PerkClaim) => void;
};

export function PerkClaimsTab({ claims, pagination, search, onSearchChange, onViewDetails, onRedeem, onUndoRedeem }: PerkClaimsTabProps) {
  return (
    <Card className="gap-0 overflow-hidden border-0 py-0 shadow-lg">
      <CardHeader className="px-4 py-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          Customer Perk Claims
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 sm:h-5 sm:w-5" />
          <Input
            type="text"
            placeholder="Search by customer, reward, or card..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 pl-9 text-sm sm:h-12 sm:pl-10"
          />
        </div>

        <div className="hidden overflow-x-auto rounded-lg border lg:block">
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
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <TableRow key={claim.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium">{claim.customer.username}</div>
                      <div className="text-xs text-gray-500">{claim.customer.email}</div>
                    </TableCell>
                    <TableCell className="font-medium">{claim.perk.reward}</TableCell>
                    <TableCell>{claim.loyalty_card.name}</TableCell>
                    <TableCell>
                      {claim.is_redeemed ? <Badge className="bg-gray-500">Redeemed</Badge> : <Badge className="bg-green-500">Available</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewDetails(claim)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!claim.is_redeemed ? (
                          <Button size="sm" onClick={() => onRedeem(claim)} className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => onUndoRedeem(claim)}>
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-gray-500">
                    <Award className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p>No perk claims found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 lg:hidden">
          {claims.length > 0 ? (
            claims.map((claim) => (
              <Card key={claim.id} className="shadow-md">
                <CardContent className="space-y-3 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold sm:text-base">{claim.customer.username}</p>
                      <p className="truncate text-xs text-gray-500">{claim.customer.email}</p>
                    </div>
                    {claim.is_redeemed ? <Badge className="bg-gray-500">Redeemed</Badge> : <Badge className="bg-green-500">Available</Badge>}
                  </div>

                  <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 truncate font-medium">{claim.perk.reward}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 truncate">{claim.loyalty_card.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{claim.stamps_at_claim} stamps</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2">
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(claim)} className="min-w-0 text-xs sm:text-sm">
                      <Eye className="mr-1 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">Details</span>
                    </Button>
                    {!claim.is_redeemed ? (
                      <Button size="sm" onClick={() => onRedeem(claim)} className="min-w-0 bg-green-600 text-xs hover:bg-green-700 sm:text-sm">
                        <Check className="mr-1 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="truncate">Redeem</span>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => onUndoRedeem(claim)} className="min-w-0 text-xs sm:text-sm">
                        <Undo2 className="mr-1 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="truncate">Undo</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-500 sm:py-12">
              <Award className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:h-12 sm:w-12" />
              <p>No perk claims found.</p>
            </div>
          )}
        </div>

        <Pagination
          data={pagination}
          pageName="rewards_page"
          excludeParams={['loyalty_card_id', 'number_of_stamps']}
        />
      </CardContent>
    </Card>
  );
}

type StampCodesTabProps = {
  codes: StampCodeRecord[];
  pagination: PaginatedList<StampCodeRecord>;
  search: string;
  onSearchChange: (value: string) => void;
  formatDate: (date: string | null) => string;
  getStatusBadge: (stampCode: StampCodeRecord) => React.ReactNode;
};

export function StampCodesTab({ codes, pagination, search, onSearchChange, formatDate, getStatusBadge }: StampCodesTabProps) {
  return (
    <Card className="gap-0 overflow-hidden border-0 py-0 shadow-lg">
      <CardHeader className="px-4 py-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />
          Stamp Code History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 sm:h-5 sm:w-5" />
          <Input
            type="text"
            placeholder="Search stamp codes or customers..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 pl-9 text-sm sm:h-12 sm:pl-10"
          />
        </div>

        <div className="hidden overflow-x-auto rounded-lg border lg:block">
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
              {codes.length > 0 ? (
                codes.map((stampCode) => (
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
                  <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                    <Ticket className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p>No stamp codes found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 lg:hidden">
          {codes.length > 0 ? (
            codes.map((stampCode) => (
              <Card key={stampCode.id} className="shadow-md">
                <CardContent className="space-y-3 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold sm:text-base">{stampCode.code}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {stampCode.loyalty_card.name} - {stampCode.number_of_stamps}{' '}
                        {stampCode.number_of_stamps === 1 ? 'stamp' : 'stamps'}
                      </p>
                    </div>
                    {getStatusBadge(stampCode)}
                  </div>

                  <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                    {stampCode.customer ? (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <User className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="min-w-0 truncate font-medium">{stampCode.customer.username}</span>
                        </div>
                        <p className="ml-6 truncate text-xs text-gray-500">{stampCode.customer.email}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-gray-400">Unassigned</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 truncate">{formatDate(stampCode.created_at)}</span>
                    </div>

                    {stampCode.used_at && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="min-w-0 truncate">Used: {formatDate(stampCode.used_at)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-500 sm:py-12">
              <Ticket className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:h-12 sm:w-12" />
              <p>No stamp codes found.</p>
            </div>
          )}
        </div>

        <Pagination
          data={pagination}
          pageName="history_page"
          excludeParams={['loyalty_card_id', 'number_of_stamps']}
        />
      </CardContent>
    </Card>
  );
}

export function AccountTab({ onLogout }: { onLogout: () => void }) {
  return (
    <Card className="gap-0 overflow-hidden border-0 py-0 shadow-lg">
      <CardHeader className="px-4 py-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          Staff Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6">
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm active:bg-red-50 sm:rounded-2xl sm:p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-sm font-semibold text-red-500">Logout</span>
        </button>
      </CardContent>
    </Card>
  );
}

type StaffBottomNavProps = {
  items: StaffNavItem[];
  activeTab: string;
  onTabChange: (tab: StaffNavItem['id']) => void;
};

export function StaffBottomNav({ items, activeTab, onTabChange }: StaffBottomNavProps) {
  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-white px-1 sm:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1.5 py-2.5 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
              <div className={`relative rounded-xl p-1.5 transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                {!!item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
                {item.dot && !isActive && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />}
              </div>
              <span className={`max-w-full truncate text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type StaffDialogsProps = {
  redeemDialogOpen: boolean;
  detailDialogOpen: boolean;
  selectedClaim: PerkClaim | null;
  remarks: string;
  processing: boolean;
  onRedeemDialogChange: (open: boolean) => void;
  onDetailDialogChange: (open: boolean) => void;
  onRemarksChange: (value: string) => void;
  onMarkAsRedeemed: () => void;
  formatDate: (date: string | null) => string;
};

export function StaffDialogs({
  redeemDialogOpen,
  detailDialogOpen,
  selectedClaim,
  remarks,
  processing,
  onRedeemDialogChange,
  onDetailDialogChange,
  onRemarksChange,
  onMarkAsRedeemed,
  formatDate,
}: StaffDialogsProps) {
  return (
    <>
      <Dialog open={redeemDialogOpen} onOpenChange={onRedeemDialogChange}>
        <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Mark as Redeemed</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Confirm that this perk has been redeemed by the customer.</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2 rounded-lg bg-gray-50 p-3 sm:p-4">
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="min-w-0 truncate text-sm font-medium">{selectedClaim.customer.username}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-gray-600">Reward:</span>
                  <span className="min-w-0 truncate text-sm font-medium">{selectedClaim.perk.reward}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="remarks" className="text-xs sm:text-sm">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any notes..."
                  value={remarks}
                  onChange={(event) => onRemarksChange(event.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => onRedeemDialogChange(false)} disabled={processing} className="h-10 text-sm">
              Cancel
            </Button>
            <Button onClick={onMarkAsRedeemed} disabled={processing} className="h-10 bg-green-600 text-sm hover:bg-green-700">
              {processing ? 'Processing...' : 'Mark as Redeemed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={onDetailDialogChange}>
        <DialogContent className="max-h-[85vh] max-w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl">Perk Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0 rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="mb-1 text-xs text-gray-600">Customer</p>
                  <p className="truncate text-base font-semibold sm:text-lg">{selectedClaim.customer.username}</p>
                  <p className="truncate text-xs text-gray-500 sm:text-sm">{selectedClaim.customer.email}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="mb-1 text-xs text-gray-600">Status</p>
                  {selectedClaim.is_redeemed ? <Badge className="mt-1 bg-gray-500">Redeemed</Badge> : <Badge className="mt-1 bg-green-500">Available</Badge>}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                <p className="mb-1 text-xs font-semibold text-blue-600">REWARD</p>
                <p className="text-base font-semibold text-gray-900 sm:text-lg">{selectedClaim.perk.reward}</p>
                {selectedClaim.perk.details && <p className="mt-1 text-sm text-gray-600">{selectedClaim.perk.details}</p>}
              </div>

              <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                <p className="mb-1 text-xs text-gray-600">Loyalty Card</p>
                <div className="mt-1 flex items-center gap-2">
                  {selectedClaim.loyalty_card.logo && (
                    <img src={`/${selectedClaim.loyalty_card.logo}`} alt={selectedClaim.loyalty_card.name} className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10" />
                  )}
                  <span className="min-w-0 truncate text-sm font-semibold sm:text-base">{selectedClaim.loyalty_card.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="mb-1 text-xs text-gray-600">Stamps at Claim</p>
                  <p className="text-xl font-semibold sm:text-2xl">{selectedClaim.stamps_at_claim}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="mb-1 text-xs text-gray-600">Claimed At</p>
                  <p className="text-xs font-semibold sm:text-sm">{formatDate(selectedClaim.created_at)}</p>
                </div>
              </div>

              {selectedClaim.is_redeemed && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
                      <p className="mb-1 text-xs font-semibold text-green-600">Redeemed At</p>
                      <p className="text-xs font-semibold sm:text-sm">{selectedClaim.redeemed_at ? formatDate(selectedClaim.redeemed_at) : 'N/A'}</p>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
                      <p className="mb-1 text-xs font-semibold text-green-600">Redeemed By</p>
                      <p className="truncate text-xs font-semibold sm:text-sm">{selectedClaim.redeemed_by?.username || 'N/A'}</p>
                    </div>
                  </div>

                  {selectedClaim.remarks && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
                      <p className="mb-1 text-xs font-semibold text-yellow-600">REMARKS</p>
                      <p className="text-sm text-gray-700">{selectedClaim.remarks}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => onDetailDialogChange(false)} className="h-10 text-sm">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
