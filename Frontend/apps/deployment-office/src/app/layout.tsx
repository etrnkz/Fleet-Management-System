import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deployment Office Portal - Fleet Management",
  description: "Deployment Office dashboard for fleet management system",
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
