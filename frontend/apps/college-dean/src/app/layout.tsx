import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUFMS | College Dean",
  description:
    "Haramaya University Fleet Management — college dean portal for college-level trip approvals and oversight.",
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
