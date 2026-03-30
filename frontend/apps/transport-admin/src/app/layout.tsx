import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUFMS | Transport Admin",
  description:
    "Haramaya University Fleet Management — transport administration portal for fleet, fuel, and operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
