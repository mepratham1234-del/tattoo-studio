import type { Metadata, Viewport } from "next";
import { Inter, Abhaya_Libre } from "next/font/google";
import "./globals.css";

// 1. IMPORT GOOGLE FONTS
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const abhaya = Abhaya_Libre({ 
  weight: ['400', '500', '600', '700', '800'], // We need 800 for ExtraBold
  subsets: ["latin"], 
  variable: "--font-abhaya" 
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
};

// 3. INJECT FONTS INTO THE BODY
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Notice both font variables are added here */}
      <body className={`${inter.variable} ${abhaya.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}