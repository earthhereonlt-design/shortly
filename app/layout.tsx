import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RailLink — Beautiful link management",
    template: "%s · RailLink",
  },
  description:
    "Shorten, brand, and analyze every link. RailLink is the premium link management platform built for teams that care about craft.",
  keywords: [
    "url shortener",
    "link management",
    "link analytics",
    "branded links",
    "qr codes",
  ],
  openGraph: {
    type: "website",
    title: "RailLink — Beautiful link management",
    description:
      "Shorten, brand, and analyze every link. Premium link management, beautifully made.",
    url: siteUrl,
    siteName: "RailLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "RailLink — Beautiful link management",
    description:
      "Shorten, brand, and analyze every link. Premium link management, beautifully made.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
