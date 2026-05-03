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
  customer: {
    username: string;
    email: string;
  } | null;
  used_at: string | null;
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

  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, { preserveState: true });
    }
  };

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
    if (stampCode.is_expired) {
      return <Badge className="bg-red-500 text-white">Expired</Badge>;
    }
    if (stampCode.used_at) {
      return <Badge className="bg-green-500 text-white">Used</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
    </AppLayout>
  );
}