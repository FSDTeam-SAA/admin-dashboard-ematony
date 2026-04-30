"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ban } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { StatsCardSkeleton, TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDashboardStatsApi, getUsersApi } from "@/lib/api";
import { getInitials, getUserDisplayName } from "@/lib/formatters";
import type { User } from "@/types";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const userReportPath =
  "M0 255 C85 220, 130 230, 170 210 C225 180, 275 150, 330 160 C390 170, 430 125, 500 135 C575 145, 615 120, 680 85 C740 55, 800 95, 860 70 C920 45, 970 60, 1020 20";

const userReportPathSecondary =
  "M0 290 C70 295, 110 280, 150 245 C190 220, 240 275, 285 250 C335 220, 370 245, 420 220 C460 200, 505 240, 540 185 C580 150, 620 210, 670 190 C715 172, 755 220, 810 195 C855 175, 890 225, 940 150 C980 90, 1010 180, 1060 165";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getUserStatus(user: User, index: number) {
  if (user.isBlocked) return { label: "Rejected", className: "bg-[#fdeaea] text-[#ef4444]" };
  if (index % 3 === 0) return { label: "Pending", className: "bg-[#fdf4e8] text-[#f59e0b]" };
  return { label: "Approved", className: "bg-[#e8f7f1] text-[#083f32]" };
}

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStatsApi().then((response) => response.data.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: () => getUsersApi(1, 5).then((response) => response.data),
  });

  const activityRows = useMemo(() => usersData?.data ?? [], [usersData]);

  return (
    <div className="space-y-6 px-0 pb-8 lg:px-0">
      <section className="grid gap-5 px-4 pt-6 sm:px-6 lg:grid-cols-3 lg:px-6">
        {statsLoading ? (
          <StatsCardSkeleton />
        ) : (
          <>
            <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-8 py-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                Total Users
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div className="text-[28px] font-semibold leading-[1.1] text-[#083f32]">
                  {statsData?.totalUsers ?? 0}
                </div>
                <div className="text-[16px] font-semibold leading-[1.1] text-[#22c55e]">
                  + 36% ↑
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-8 py-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                Active Groups
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div className="text-[28px] font-semibold leading-[1.1] text-[#083f32]">
                  {statsData?.activeGroups ?? 0}
                </div>
                <div className="text-[16px] font-semibold leading-[1.1] text-[#ff2a2a]">
                  - 14% ↓
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-8 py-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="text-[16px] font-normal leading-[1.1] text-[#083f32]">
                Total Transactions
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div className="text-[28px] font-semibold leading-[1.1] text-[#083f32]">
                  {formatCompact(statsData?.totalPayments ?? 0)}
                </div>
                <div className="text-[16px] font-semibold leading-[1.1] text-[#22c55e]">
                  + 36% ↑
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mx-4 rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:mx-6 lg:mx-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h2 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
            User Report
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-[16px] font-medium leading-[1.1] text-[#7b8192]">
            <button className="rounded-[8px] border border-[#8f979e] px-5 py-3 text-[#083f32]">
              12 Months
            </button>
            <button>6 Months</button>
            <button>30 Days</button>
            <button>7 Days</button>
            <button className="ml-auto rounded-[8px] border border-[#d9e3ee] px-4 py-3 text-[#083f32]">
              Export PDF
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] bg-white">
          <div className="absolute left-[18%] top-[12%] z-10 rounded-[12px] border border-[#d9e3ee] bg-white px-5 py-3 text-center shadow-[0_14px_36px_rgba(8,63,50,0.10)]">
            <div className="text-[16px] text-[#7b8192]">March 2026</div>
            <div className="mt-2 text-[24px] font-semibold text-[#083f32]">591</div>
          </div>

          <div className="h-[430px] w-full">
            <svg viewBox="0 0 1060 340" className="h-full w-full">
              <defs>
                <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#eef4ff" />
                  <stop offset="100%" stopColor="#f7f9fd" />
                </linearGradient>
              </defs>

              <path d={`${userReportPathSecondary} L1060 340 L0 340 Z`} fill="url(#chart-fill)" />
              <path d={userReportPathSecondary} fill="none" stroke="#0f7c4c" strokeWidth="3" />
              <path d={userReportPath} fill="none" stroke="#22c55e" strokeWidth="3" />
              <circle cx="215" cy="112" r="6" fill="#083f32" />
              <line x1="215" y1="112" x2="215" y2="245" stroke="#d9e3ee" />
              <line x1="0" y1="320" x2="1060" y2="320" stroke="#2aa56d" />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-y-3 text-[16px] font-normal leading-[1.1] text-[#5f6472] sm:grid-cols-6 lg:grid-cols-12">
            {months.map((month) => (
              <div key={month} className="text-center">
                {month}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-4 rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:mx-6 lg:mx-6">
        <h2 className="mb-8 text-[24px] font-semibold leading-[1.1] text-[#083f32]">
          Recent Activity
        </h2>

        {usersLoading ? (
          <TableSkeleton rows={5} cols={5} />
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
                  {activityRows.map((user, index) => {
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
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination page={1} totalPages={12} onPageChange={() => {}} />
          </>
        )}
      </section>
    </div>
  );
}
