"use client";

import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/formatters";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Ematony";
  const image = (session?.user as { image?: string } | undefined)?.image ?? "";

  return (
    <header className="sticky top-0 z-20 flex h-[90px] shrink-0 items-center justify-between bg-[#e8f8ef] px-4 sm:px-6 lg:px-7">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-[10px] text-[#083f32] lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block" />

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[16px] font-semibold leading-[1.1] text-[#083f32]">
          {name}
        </span>
        <Avatar className="h-[44px] w-[44px] border border-[#cde3d8]">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-[#064b39] text-[14px] text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
