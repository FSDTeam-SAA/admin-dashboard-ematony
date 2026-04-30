"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getPaymentsApi } from "@/lib/api";
import { formatCurrency, getInitials, getUserDisplayName } from "@/lib/formatters";
import { useDebounce } from "@/hooks/use-debounce";
import type { Payment } from "@/types";

function getTypePill(payment: Payment) {
  if (payment.type.includes("topup") || payment.type.includes("contribution")) {
    return { label: "Topup", className: "bg-[#e8f7f1] text-[#083f32]" };
  }

  return { label: "Withdraw", className: "bg-[#fdeaea] text-[#ef4444]" };
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", page],
    queryFn: () => getPaymentsApi(page, 10).then((response) => response.data),
  });

  const rows = useMemo(() => {
    const items = data?.data ?? [];
    if (!debouncedSearch.trim()) return items;

    return items.filter((payment) =>
      getUserDisplayName(payment.userId).toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [data?.data, debouncedSearch]);

  const total = data?.meta?.total ?? 0;
  const start = rows.length ? (page - 1) * 10 + 1 : 0;
  const end = rows.length ? start + rows.length - 1 : 0;

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-6">
      <section className="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
              Transaction Management
            </h1>
            <div className="mt-4 flex items-center gap-4 text-[16px] font-normal leading-[1.1] text-[#083f32]">
              <span>Dashboard</span>
              <span className="text-[#6b7280]">›</span>
              <span>Transaction Management</span>
            </div>
          </div>

          <div className="relative w-full max-w-[356px]">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-[52px] rounded-[12px] border-[#b8c7da] bg-white pl-5 pr-[64px] text-[16px] text-[#083f32] placeholder:text-[#083f32]"
              placeholder="Search for User"
            />
            <button
              type="button"
              className="absolute right-0 top-0 flex h-[52px] w-[62px] items-center justify-center rounded-r-[12px] bg-[#064b39] text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-6">
                <thead>
                  <tr className="text-left text-[16px] font-semibold leading-[1.1] text-[#083f32]">
                    <th className="pb-1">Member Name</th>
                    <th className="pb-1">Date</th>
                    <th className="pb-1">Amount</th>
                    <th className="pb-1">Type</th>
                    <th className="pb-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((payment) => {
                      const tone = getTypePill(payment);
                      const name = getUserDisplayName(payment.userId);
                      return (
                        <tr key={payment._id} className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                          <td className="py-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-[52px] w-[52px]">
                                <AvatarImage
                                  src={
                                    typeof payment.userId === "object"
                                      ? payment.userId.avatar?.url
                                      : undefined
                                  }
                                  alt={name}
                                />
                                <AvatarFallback className="bg-[#d8efe5] text-[#083f32]">
                                  {getInitials(name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{name}</span>
                            </div>
                          </td>
                          <td>{new Date(payment.createdAt).toLocaleDateString("en-GB")}</td>
                          <td>{formatCurrency(payment.price)}</td>
                          <td>
                            <span
                              className={`inline-flex min-w-[132px] items-center justify-center rounded-full px-5 py-2 text-[16px] font-medium ${tone.className}`}
                            >
                              {tone.label}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#fdeaea] text-[#ff2a2a]"
                              onClick={() => toast.error("Delete transaction is not available from the API yet.")}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[16px] text-[#7b8192]">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-[16px] font-medium leading-[1.1] text-[#083f32]">
                Showing {start}-{end} of {total} results
              </div>
              <Pagination
                page={page}
                totalPages={data?.meta.totalPages ?? 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
