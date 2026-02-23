import type { Metadata, Viewport } from "next";
import { Inter, Abhaya_Libre } from "next/font/google";
import "./globals.css";

// 1. IMPORT GOOGLE FONTS
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const abhaya = Abhaya_Libre({ 
  weight: ['400', '500', '600', '700', '800'], 
  subsets: ["latin"], 
  variable: "--font-abhaya",
  display: 'swap',
});

// 2. MOBILE VIEWPORT LOCK
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFFFF", 
};

export const metadata: Metadata = {
  title: "Tattoo Tattva",
  description: "Automated Studio Management Engine",
  manifest: "/manifest.json", 
};

// 3. INJECT FONTS INTO THE BODY
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // FIX: Added suppressHydrationWarning to ignore browser extension injections
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Notice both font variables are added here so Tailwind can see them */}
      <body className={`${inter.variable} ${abhaya.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}