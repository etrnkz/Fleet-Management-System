import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PushNotificationPrompt } from "../components/PushNotificationPrompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HUFMS — Department Head",
  description: "Fleet Management System - Department Head Portal",
  icons: {
    icon: '/hulogo.png',
    shortcut: '/hulogo.png',
    apple: '/hulogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        {children}
        <PushNotificationPrompt />
      </body>
    </html>
  );
}
