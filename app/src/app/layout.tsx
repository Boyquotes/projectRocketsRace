import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import Providers from '@/components/Providers';
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Rockets Races - Challenge",
  description: "Rocket racing simulation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <nav className="bg-gray-100 p-4">
          <div className="container mx-auto flex items-center space-x-4">
            <div className="flex-grow">
              <div className="flex space-x-4 items-center">
                <Link href="/" className="text-xl font-bold text-black hover:opacity-70 transition-opacity duration-200">Rockets Races</Link>
                <Link href="/races" className="text-lg text-black hover:opacity-70 transition-opacity duration-200">Admin Races</Link>
              </div>
            </div>
          </div>
        </nav>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}