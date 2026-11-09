import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MswProvider } from "@/components/MswProvider";

// Font sesuai Figma: Inter untuk body, Plus Jakarta Sans untuk heading (FE-01).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoClean",
  description: "Laporkan dan bersihkan sampah di pesisir, kumpulkan poin, tukar hadiah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MswProvider>{children}</MswProvider>
      </body>
    </html>
  );
}
