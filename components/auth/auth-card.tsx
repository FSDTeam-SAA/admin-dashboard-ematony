"use client";

import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "mx-auto rounded-[26px] border border-[#d8e2ef] bg-white px-10 py-8 shadow-[0_3px_16px_rgba(17,52,80,0.10)]",
        className
      )}
    >
      <div className="items-center gap-3 px-0 pb-7 pt-0 text-center">
        <BrandLogo className="mb-1" width={140} height={118} />
        <h1 className="text-[34px] font-semibold leading-[1.1] text-[#083f32]">
          {title}
        </h1>
        <p className="mx-auto max-w-[420px] text-center text-[16px] font-normal leading-[1.1] text-[#083f32]">
          {description}
        </p>
      </div>
      <div className="px-0 pb-0">{children}</div>
    </div>
  );
}
