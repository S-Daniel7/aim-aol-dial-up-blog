import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteChrome } from "@/components/SiteChrome";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: {
    template: "%s · soapie",
    default: "soapie",
  },
  description:
    "a personal corner of the internet — aim chat logs, live thoughts, and things to remember",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "soapie",
    title: "soapie",
    description: "a personal corner of the internet — aim chat logs, live thoughts, and things to remember",
  },
  twitter: {
    card: "summary",
    title: "soapie",
    description: "a personal corner of the internet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${[vt323.variable].join(" ")} min-h-screen text-text bg-page-bg`}>
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
