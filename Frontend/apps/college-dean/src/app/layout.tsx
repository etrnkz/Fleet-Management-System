import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Dean Portal - Fleet Management",
  description: "College Dean dashboard for fleet management system",
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
