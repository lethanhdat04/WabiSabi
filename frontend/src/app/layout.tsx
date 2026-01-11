import type { Metadata } from "next";
import { Montserrat_Alternates, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const vietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-vietnam",
});

export const metadata: Metadata = {
  title: "Nihongo Master - Japanese Learning Platform",
  description: "Master Japanese through interactive learning, practice, and community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${vietnam.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
