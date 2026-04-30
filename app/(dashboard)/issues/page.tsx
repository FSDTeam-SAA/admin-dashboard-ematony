"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getIssuesApi, updateIssueStatusApi } from "@/lib/api";
import { getInitials, getUserDisplayName } from "@/lib/formatters";
import { useDebounce } from "@/hooks/use-debounce";
import type { SavingsGroup, SupportTicket } from "@/types";

function getIssueStatus(status: string) {
  if (status === "resolved") {
    return { label: "Resolved", className: "bg-[#e8f7f1] text-[#083f32]" };
  }

  return { label: "Pending", className: "bg-[#fdf4e8] text-[#f59e0b]" };
}

function getGroupName(group?: string | SavingsGroup | null) {
  if (!group) return "No Group";
  if (typeof group === "string") return group;
  return group.name;
}

export default function IssuesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<SupportTicket | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-issues", page, debouncedSearch],
    queryFn: () =>
      getIssuesApi(page, 10, { search: debouncedSearch }).then((response) => response.data),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => updateIssueStatusApi(id, { status: "resolved" }),
    onSuccess: () => {
      toast.success("Issue resolved");
      queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      setSelectedIssue(null);
    },
    onError: () => toast.error("Failed to resolve issue"),
  });

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.meta?.total ?? 0;
  const start = rows.length ? (page - 1) * 10 + 1 : 0;
  const end = rows.length ? start + rows.length - 1 : 0;

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-6">
      <section className="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
              Issues Management
            </h1>
            <div className="mt-4 flex items-center gap-4 text-[16px] font-normal leading-[1.1] text-[#083f32]">
              <span>Dashboard</span>
              <span className="text-[#6b7280]">›</span>
              <span>Issue Management</span>
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
                    <th className="pb-1">Group Name</th>
                    <th className="pb-1">Issue</th>
                    <th className="pb-1">Status</th>
                    <th className="pb-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((issue) => {
                      const status = getIssueStatus(issue.status);
                      const name = getUserDisplayName(issue.userId);
                      return (
                        <tr key={issue._id} className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                          <td className="py-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-[52px] w-[52px]">
                                <AvatarFallback className="bg-[#d8efe5] text-[#083f32]">
                                  {getInitials(name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{name}</span>
                            </div>
                          </td>
                          <td>{getGroupName(issue.groupId)}</td>
                          <td>{issue.subject || "Payment Problem..."}</td>
                          <td>
                            <span
                              className={`inline-flex min-w-[132px] items-center justify-center rounded-full px-5 py-2 text-[16px] font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-4">
                              <button
                                type="button"
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#e8f7f1] text-[#083f32]"
                                onClick={() => setSelectedIssue(issue)}
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#fdeaea] text-[#ff2a2a]"
                                onClick={() =>
                                  resolveMutation.mutate(issue._id)
                                }
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[16px] text-[#7b8192]">
                        No issues found.
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

      <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        <DialogContent
          className="w-[min(92vw,600px)] max-w-[600px] rounded-[32px] border-0 bg-white px-10 py-8 text-[#083f32] shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-0"
        >
          {selectedIssue ? (
            <div className="space-y-10">
              <div className="flex justify-center">
                <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#fdf4e8] text-[#f59e0b]">
                  ?
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="text-[20px] font-semibold">Full Name</div>
                  <div className="mt-3 text-[16px]">
                    {getUserDisplayName(selectedIssue.userId)}
                  </div>
                </div>
                <div>
                  <div className="text-[20px] font-semibold">Group Name</div>
                  <div className="mt-3 text-[16px]">{getGroupName(selectedIssue.groupId)}</div>
                </div>
                <div>
                  <div className="text-[20px] font-semibold">Issue Category</div>
                  <div className="mt-3 text-[16px] capitalize">
                    {selectedIssue.category.replaceAll("_", "/")}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[20px] font-semibold">Issue</div>
                <div className="mt-4 text-[16px] leading-[1.25] text-[#083f32]">
                  {selectedIssue.message}
                </div>
              </div>

              <button
                type="button"
                className="h-[58px] w-full rounded-[18px] bg-[#064b39] text-[18px] font-medium text-white"
                onClick={() => resolveMutation.mutate(selectedIssue._id)}
              >
                Resolve
              </button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
