import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUFMS Admin Portal",
  description: "Fleet Management System - Admin Portal",
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
