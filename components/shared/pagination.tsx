"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.filter(
    (current) => current === 1 || current === totalPages || Math.abs(current - page) <= 1
  );

  const items: Array<number | "ellipsis"> = [];
  visiblePages.forEach((current, index) => {
    if (index > 0 && current - visiblePages[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(current);
  });

  const buttonClass =
    "flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border text-[16px] font-normal leading-[1.1] transition-colors";

  return (
    <div className="mt-10 flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          buttonClass,
          "border-[#b8c7da] bg-white text-[#6f7f95] hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#b8c7da] bg-white text-[16px] text-[#8da0b6]"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(
              buttonClass,
              page === item
                ? "border-[#064b39] bg-[#064b39] text-white"
                : "border-[#b8c7da] bg-white text-[#6f7f95] hover:bg-[#f6f8fb]"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          buttonClass,
          "border-[#b8c7da] bg-white text-[#6f7f95] hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
