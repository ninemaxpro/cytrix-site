import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cytrix — Cloud Security Intelligence Platform",
  description:
    "One engineer. Real scanners, real threat intel, real IR playbooks. From finding to remediation in one CLI.",
  openGraph: {
    title: "Cytrix — Cloud Security Intelligence Platform",
    description:
      "From scanner ingestion to threat intel to automated IR playbooks. A full security operations platform built by one engineer.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cytrix — Cloud Security Intelligence Platform",
    description:
      "From scanner ingestion to threat intel to automated IR playbooks.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
