"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CircleEllipsis,
  Grid2x2,
  LogOut,
  Settings,
  SquareArrowOutUpRight,
  UserRound,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard Overview", icon: Grid2x2 },
  { href: "/users", label: "User Management", icon: UserRound },
  { href: "/groups", label: "Group Management", icon: UsersRound },
  { href: "/issues", label: "Issue Management", icon: CircleEllipsis },
  { href: "/payments", label: "Transaction Management", icon: SquareArrowOutUpRight },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[310px] flex-col overflow-y-auto bg-[#e8f8ef] px-6 py-5 text-[#083f32]">
      <div className="flex items-center justify-center pb-10 pt-2">
        <BrandLogo width={164} height={138} />
      </div>

      <nav className="space-y-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-[42px] items-center gap-4 rounded-[10px] px-4 text-[16px] font-normal leading-[1.1] transition-colors",
                active
                  ? "bg-[#064b39] text-white"
                  : "text-[#083f32] hover:bg-[#d8efe5]"
              )}
            >
              <Icon className="h-[20px] w-[20px]" strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <Dialog>
          <DialogTrigger
            render={
              <button className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#ff3b30] bg-transparent px-4 text-[16px] font-normal leading-[1.1] text-[#ff3b30] outline-none transition hover:bg-[#fff1f0]" />
            }
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </DialogTrigger>

          <DialogContent
            showCloseButton={false}
            className="w-[min(92vw,592px)] max-w-[592px] rounded-[28px] border-0 bg-white px-7 py-8 text-[#111827] shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-0"
          >
            <DialogHeader className="items-center gap-4 text-center">
              <DialogTitle className="text-[22px] font-semibold leading-[1.15] text-[#101828]">
                Are you sure want to Log out?
              </DialogTitle>
              <DialogDescription className="text-[16px] font-normal leading-[1.1] text-[#101828]">
                Tap log out from the dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 grid grid-cols-2 gap-4">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="h-[52px] rounded-[12px] border-[#ff3b30] bg-white text-[16px] font-medium text-[#101828] hover:bg-[#fff6f5]"
                  />
                }
              >
                Cancel
              </DialogClose>

              <Button
                className="h-[52px] rounded-[12px] border-0 bg-[#ff1d3f] text-[16px] font-medium text-white hover:bg-[#eb1234]"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Log out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
