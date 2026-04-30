"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
}

export function BrandLogo({
  className,
  imageClassName,
  width = 170,
  height = 150,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src="/ajo-family.png"
        alt="Ajo Family"
        width={width}
        height={height}
        priority
        className={cn("h-auto w-auto object-contain", imageClassName)}
      />
    </div>
  );
}
