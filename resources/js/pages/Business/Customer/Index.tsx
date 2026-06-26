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
import { Eye, Search } from "lucide-react";
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

interface Customer {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface Props {
  customers: Paginated<Customer>;
  filters: {
    search?: string;
  };
}

export default function Index({ customers, filters }: Props) {
  const [search, setSearch] = useState(filters.search || "");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      router.get(
        '/business/customers',
        { search },
        {
          preserveState: true,
          replace: true,
        }
      );
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AppLayout>
      <Head title="Customers" />
      <ModuleHeading
        title="Customers"
        description="Manage your business customers."
      />

      <div className="mt-6">
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search customers..."
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
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-start">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.data.length > 0 ? (
                customers.data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.username}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{formatDate(customer.created_at)}</TableCell>
                    <TableCell className="justify-center">
                      <button className="cursor-pointer" onClick={() => router.visit(`/business/customers/${customer.id}`)}>
                        <Eye/>
                      </button>
                    </TableCell> 
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {customers.data.length > 0 ? (
            customers.data.map((customer) => (
              <div
              onClick={() => router.visit(`/business/customers/${customer.id}`)}
                key={customer.id}
                className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
              >
                <div>
                  <div className="text-xs text-gray-500 mb-1">Name</div>
                  <div className="font-medium text-sm">{customer.username}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="text-sm break-all">{customer.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Created At</div>
                  <div className="text-sm">{formatDate(customer.created_at)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              No customers found.
            </div>
          )}
        </div>

        {customers.last_page > 1 && (
 
              <Pagination data={customers} />

        )}
      </div>
    </AppLayout>
  );
}
