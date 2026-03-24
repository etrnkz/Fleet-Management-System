import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "President Portal - Fleet Management",
  description: "President dashboard for fleet management system",
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
