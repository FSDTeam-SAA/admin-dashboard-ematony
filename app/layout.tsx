import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const outfitHeading = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit-heading",
});

export const metadata: Metadata = {
  title: "Ematony Admin Dashboard",
  description: "Ematony Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${outfitHeading.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
