"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Search } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { blockUserApi, getUsersApi } from "@/lib/api";
import { getInitials, getUserDisplayName } from "@/lib/formatters";
import { useDebounce } from "@/hooks/use-debounce";
import type { User } from "@/types";

function getUserStatus(user: User, index: number) {
  if (user.isBlocked) return { label: "Rejected", className: "bg-[#fdeaea] text-[#ef4444]" };
  if (index % 3 === 0) return { label: "Pending", className: "bg-[#fdf4e8] text-[#f59e0b]" };
  return { label: "Approved", className: "bg-[#e8f7f1] text-[#083f32]" };
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, debouncedSearch],
    queryFn: () => getUsersApi(page, 10, debouncedSearch).then((response) => response.data),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => blockUserApi(id),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const start = rows.length ? (page - 1) * 10 + 1 : 0;
  const end = rows.length ? start + rows.length - 1 : 0;

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-6">
      <section className="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
              User Management
            </h1>
            <div className="mt-4 flex items-center gap-4 text-[16px] font-normal leading-[1.1] text-[#083f32]">
              <span>Dashboard</span>
              <span className="text-[#6b7280]">›</span>
              <span>User Management</span>
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
                    <th className="pb-1">User Name</th>
                    <th className="pb-1">Phone Number</th>
                    <th className="pb-1">Email</th>
                    <th className="pb-1">Status</th>
                    <th className="pb-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((user, index) => {
                      const status = getUserStatus(user, index);
                      const name = getUserDisplayName(user);

                      return (
                        <tr key={user._id} className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                          <td className="py-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-[52px] w-[52px]">
                                <AvatarImage src={user.avatar?.url} alt={name} />
                                <AvatarFallback className="bg-[#064b39] text-white">
                                  {getInitials(name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{name}</span>
                            </div>
                          </td>
                          <td>{user.phone || "+1(000) 000-0000"}</td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`inline-flex min-w-[150px] items-center justify-center rounded-full px-5 py-2 text-[16px] font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#fdeaea] text-[#ff2a2a]"
                              onClick={() => blockMutation.mutate(user._id)}
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[16px] text-[#7b8192]">
                        No users found.
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
