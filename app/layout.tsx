import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const interHeading = Inter({ subsets: ["latin"], variable: "--font-heading" });

const interMono = Inter({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Disposable Vape Distributor in White Plains - Central Smoke Distro",
  description:
    "Central Smoke Distro is a wholesale distributor of disposable vapes and smoke shop essentials in White Plains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", interMono.variable, "font-sans", inter.variable, interHeading.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
