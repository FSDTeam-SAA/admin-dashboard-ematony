import type { User } from "@/types";

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function getUserDisplayName(user?: string | User | null) {
  if (!user) return "-";
  if (typeof user === "string") return user;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return (
    user.name ??
    (fullName || user.email || "-")
  );
}

export function getInitials(name?: string) {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
