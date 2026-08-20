import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Rajdhani, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import SpecialEventPopup from "@/components/home/SpecialEventPopup";
import "./globals.css";


const display = Rajdhani({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "A4 ESPORTS — India's Competitive Free Fire Platform",
  description:
    "Join daily custom rooms, free tournaments, and competitive Free Fire scrims. Built for serious mobile gamers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('ffs-theme');
                if (t === 'light') {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
              <SpecialEventPopup />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>

        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}