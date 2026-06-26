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

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface StampCode {
  id: number;
  code: string;
  number_of_stamps: number;
  customer: {
    username: string;
    email: string;
  } | null;
  used_at: string | null;
  deleted_at: string | null;
  is_expired: boolean;
  created_at: string;
  loyalty_card: {
    name: string
  }
}

interface Props {
  stampCodes: Paginated<StampCode>;
  filters: {
    search?: string;
  };
}

export default function Index({ stampCodes, filters }: Props) {
  const [search, setSearch] = useState(filters.search || "");
  const [stampToCancel, setStampToCancel] = useState<StampCode | null>(null);
  const [cancelPhrase, setCancelPhrase] = useState("");
  const [cancelingStamp, setCancelingStamp] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      router.get(
        '/business/stamp-codes',
        { search },
        {
          preserveState: true,
          replace: true,
        }
      );
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (stampCode: StampCode) => {
    if (stampCode.deleted_at) {
      return <Badge className="bg-gray-500 text-white">Canceled</Badge>;
    }
    if (stampCode.is_expired) {
      return <Badge className="bg-red-500 text-white">Expired</Badge>;
    }
    if (stampCode.used_at) {
      return <Badge className="bg-green-500 text-white">Used</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const openCancelDialog = (stampCode: StampCode) => {
    setStampToCancel(stampCode);
    setCancelPhrase("");
  };

  const closeCancelDialog = (force = false) => {
    if (cancelingStamp && !force) return;

    setStampToCancel(null);
    setCancelPhrase("");
  };

  const cancelStamp = () => {
    if (!stampToCancel || cancelPhrase !== "cancel stamp") return;

    router.post(
      `/business/stamp-codes/${stampToCancel.id}/cancel`,
      {},
      {
        preserveScroll: true,
        onStart: () => setCancelingStamp(true),
        onSuccess: () => {
          toast.success("Stamp canceled. Ask the customer to refresh their phone.");
          closeCancelDialog(true);
        },
        onError: (errors) => {
          toast.error(errors.stamp || "Failed to cancel stamp. Please try again.");
        },
        onFinish: () => setCancelingStamp(false),
      },
    );
  };

  return (
    <AppLayout>
      <Head title="Stamp Codes" />
      <ModuleHeading
        title="Stamp Codes"
        description="Manage your issued stamp codes."
      />

      <div className="mt-4 sm:mt-6  sm:px-0">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search stamp codes or customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {stampCodes.data.length > 0 ? (
            stampCodes.data.map((stampCode) => (
              <div
                key={stampCode.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-mono font-medium text-xs break-all pr-2">
                    {stampCode.loyalty_card.name} | {stampCode.code}
                  </div>
                  {getStatusBadge(stampCode)}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Customer:</span>
                    {stampCode.customer ? (
                      <div className="mt-1">
                        <div className="font-medium">
                          {stampCode.customer.username}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {stampCode.customer.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 ml-2">Unassigned</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-xs">Number of Stamps: </span>
                    <span className="text-gray-700">{stampCode.number_of_stamps}</span>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-xs">Used At: </span>
                    <span className="text-gray-700">{formatDate(stampCode.used_at)}</span>
                  </div>



                  <div>
                    <span className="text-gray-500 font-medium text-xs">Created: </span>
                    <span className="text-gray-700">{formatDate(stampCode.created_at)}</span>
                  </div>

                  {stampCode.used_at && !stampCode.deleted_at && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => openCancelDialog(stampCode)}
                    >
                      Cancel Stamp
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              No stamp codes found.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loyalty Card</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Number of Stamps</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Used At</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stampCodes.data.length > 0 ? (
                stampCodes.data.map((stampCode) => (
                  <TableRow key={stampCode.id}>
                    <TableCell>{stampCode.loyalty_card.name}</TableCell>
                    <TableCell className="font-mono font-medium">
                      {stampCode.code}
                    </TableCell>
                    <TableCell>
                      {stampCode.number_of_stamps}
                    </TableCell>
                    <TableCell>
                      {stampCode.customer ? (
                        <div>
                          <div className="font-medium">
                            {stampCode.customer.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stampCode.customer.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(stampCode)}</TableCell>
                    <TableCell>{formatDate(stampCode.used_at)}</TableCell>
                    <TableCell>{formatDate(stampCode.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {stampCode.used_at && !stampCode.deleted_at ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => openCancelDialog(stampCode)}
                        >
                          Cancel Stamp
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No stamp codes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {stampCodes.last_page > 1 && (
            <Pagination data={stampCodes}/>
        )}
      </div>

      <AlertDialog
        open={!!stampToCancel}
        onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this stamp?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This action can&apos;t be undone. The stamp will be canceled,
                  and the customer will need to refresh their phone to see the
                  updated card.
                </p>
                {stampToCancel && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-left">
                    <p>
                      <span className="font-medium text-foreground">Card:</span>{" "}
                      {stampToCancel.loyalty_card.name}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Customer:</span>{" "}
                      {stampToCancel.customer?.username || "Unassigned"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Stamps:</span>{" "}
                      {stampToCancel.number_of_stamps}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <label
                    htmlFor="cancel-stamp-confirmation"
                    className="block font-medium text-foreground"
                  >
                    Type <span className="font-bold">cancel stamp</span> to confirm.
                  </label>
                  <Input
                    id="cancel-stamp-confirmation"
                    value={cancelPhrase}
                    onChange={(event) => setCancelPhrase(event.target.value)}
                    placeholder="cancel stamp"
                    disabled={cancelingStamp}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelingStamp}>Keep Stamp</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelPhrase !== "cancel stamp" || cancelingStamp}
              onClick={cancelStamp}
            >
              {cancelingStamp ? "Canceling..." : "Cancel Stamp"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
