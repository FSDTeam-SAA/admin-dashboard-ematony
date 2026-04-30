"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, MoreVertical, Search } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getGroupByIdApi, getGroupsApi, updateGroupStatusApi } from "@/lib/api";
import { formatCurrency, getInitials, getUserDisplayName } from "@/lib/formatters";
import { useDebounce } from "@/hooks/use-debounce";
import type { GroupDetailsResponse } from "@/types";

type GroupTab = "members" | "transactions";

function getStatusStyle(status: string) {
  if (["active", "open"].includes(status)) {
    return { label: "Active", className: "bg-[#e8f7f1] text-[#083f32]" };
  }

  return { label: "Paused", className: "bg-[#fdf4e8] text-[#f59e0b]" };
}

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GroupTab>("transactions");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-groups", page, debouncedSearch],
    queryFn: () => getGroupsApi(page, 10, debouncedSearch).then((response) => response.data),
  });

  const { data: groupDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["admin-group-details", selectedGroupId],
    queryFn: () =>
      getGroupByIdApi(selectedGroupId as string).then((response) => response.data.data),
    enabled: !!selectedGroupId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      updateGroupStatusApi(id, nextStatus),
    onSuccess: () => {
      toast.success("Group status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      queryClient.invalidateQueries({ queryKey: ["admin-group-details"] });
    },
    onError: () => toast.error("Failed to update group status"),
  });

  const rows = data?.data ?? [];
  const detail = groupDetails as GroupDetailsResponse | undefined;
  const total = data?.meta?.total ?? 0;
  const start = rows.length ? (page - 1) * 10 + 1 : 0;
  const end = rows.length ? start + rows.length - 1 : 0;

  const rotationRows = useMemo(
    () => detail?.summary.wheel.rotations ?? [],
    [detail?.summary.wheel.rotations]
  );

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-6">
      <section className="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
              Group Management
            </h1>
            <div className="mt-4 flex items-center gap-4 text-[16px] font-normal leading-[1.1] text-[#083f32]">
              <span>Dashboard</span>
              <span className="text-[#6b7280]">›</span>
              <span>Group Management</span>
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
          <TableSkeleton rows={10} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-6">
                <thead>
                  <tr className="text-left text-[16px] font-semibold leading-[1.1] text-[#083f32]">
                    <th className="pb-1">Group Name</th>
                    <th className="pb-1">Group Code</th>
                    <th className="pb-1">Member Count</th>
                    <th className="pb-1">Cycle</th>
                    <th className="pb-1">Group Status</th>
                    <th className="pb-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((group, index) => {
                      const tone = getStatusStyle(group.status);
                      return (
                        <tr key={group._id} className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                          <td className="py-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-[52px] w-[52px]">
                                <AvatarFallback className="bg-[#d8efe5] text-[#083f32]">
                                  {getInitials(group.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{group.name}</span>
                            </div>
                          </td>
                          <td>#{group.inviteCode || "112233"}</td>
                          <td>{group.maxMembers}</td>
                          <td>{`${String((index % 4) + 3).padStart(2, "0")}/12 Months`}</td>
                          <td>
                            <span
                              className={`inline-flex min-w-[132px] items-center justify-center rounded-full px-5 py-2 text-[16px] font-medium ${tone.className}`}
                            >
                              {tone.label}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-4">
                              <button
                                type="button"
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#e8f7f1] text-[#083f32]"
                                onClick={() => {
                                  setActiveTab("transactions");
                                  setSelectedGroupId(group._id);
                                }}
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#fdf4e8] text-[#111827]"
                                onClick={() =>
                                  statusMutation.mutate({
                                    id: group._id,
                                    nextStatus:
                                      group.status === "active" ? "closed" : "active",
                                  })
                                }
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[16px] text-[#7b8192]">
                        No groups found.
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

      <Dialog
        open={!!selectedGroupId}
        onOpenChange={(open) => {
          if (!open) setSelectedGroupId(null);
        }}
      >
        <DialogContent
          className="w-[min(92vw,1100px)] max-w-[1100px] rounded-[32px] border-0 bg-white px-10 py-8 text-[#083f32] shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-0"
        >
          {detailsLoading || !detail ? (
            <TableSkeleton rows={6} cols={3} />
          ) : (
            <div className="space-y-8">
              <div className="text-[20px] font-semibold leading-[1.1]">Group Details</div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-8">
                  <div>
                    <div className="text-[20px] font-semibold">Group Name</div>
                    <div className="mt-2 text-[16px]">{detail.group.name}</div>
                  </div>
                  <div>
                    <div className="text-[20px] font-semibold">Group Amount</div>
                    <div className="mt-2 text-[16px]">
                      {formatCurrency(detail.group.contributionAmount, detail.group.currencyCode)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[20px] font-semibold">Cycle Duration</div>
                    <div className="mt-2 text-[16px]">12 Months</div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="text-[20px] font-semibold">Frequency</div>
                    <div className="mt-2 text-[16px] capitalize">
                      {detail.group.contributionFrequency}
                    </div>
                  </div>
                  <div>
                    <div className="text-[20px] font-semibold">Members</div>
                    <div className="mt-2 text-[16px]">{detail.summary.membersCount}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("members")}
                  className={`h-[54px] min-w-[248px] rounded-[18px] border text-[16px] font-medium ${
                    activeTab === "members"
                      ? "border-[#1d8569] bg-[#1d8569] text-white"
                      : "border-[#8f979e] bg-white text-[#4b5563]"
                  }`}
                >
                  Members List
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className={`h-[54px] min-w-[248px] rounded-[18px] border text-[16px] font-medium ${
                    activeTab === "transactions"
                      ? "border-[#1d8569] bg-[#1d8569] text-white"
                      : "border-[#8f979e] bg-white text-[#4b5563]"
                  }`}
                >
                  Transaction
                </button>
              </div>

              {activeTab === "transactions" ? (
                <div className="space-y-4">
                  {(detail.summary.recentTransactions ?? []).slice(0, 6).map((payment) => {
                    const isTopUp = payment.price >= 0;
                    return (
                      <div
                        key={payment._id}
                        className="flex items-center justify-between rounded-[18px] border border-[#e2e8f0] px-4 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-[42px] w-[42px] items-center justify-center rounded-[10px] ${
                              isTopUp ? "bg-[#e8f7f1] text-[#083f32]" : "bg-[#fdeaea] text-[#ff2a2a]"
                            }`}
                          >
                            {isTopUp ? "↗" : "↑"}
                          </div>
                          <div>
                            <div className="text-[16px] font-medium">
                              {isTopUp ? "Top Up" : "Withdraw"}
                            </div>
                            <div className="mt-1 text-[14px] text-[#9aa7bc]">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-[16px] font-semibold">
                          {formatCurrency(Math.abs(payment.price))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {rotationRows.slice(0, 8).map((rotation, index) => {
                    const isWinner = index === 0;
                    return (
                      <div
                        key={rotation.membershipId}
                        className={`flex items-center justify-between rounded-[18px] border px-4 py-4 ${
                          isWinner
                            ? "border-[#1d8569] bg-[#1d8569] text-white"
                            : "border-[#fbbf24] bg-white text-[#083f32]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-current text-[16px]">
                            {rotation.positionNumber}
                          </div>
                          <Avatar className="h-[32px] w-[32px]">
                            <AvatarFallback className="bg-white/80 text-[#083f32]">
                              {getInitials(getUserDisplayName(rotation.user))}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[16px] font-medium">
                            {getUserDisplayName(rotation.user)}
                          </span>
                        </div>
                        <div className="text-[16px]">
                          {isWinner ? "Last Winner" : "Pending"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className="h-[58px] w-full rounded-[18px] bg-[#f59e0b] text-[18px] font-medium text-white"
                onClick={() =>
                  statusMutation.mutate({
                    id: detail.group._id,
                    nextStatus: detail.group.status === "active" ? "closed" : "active",
                  })
                }
              >
                Pause Group
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
