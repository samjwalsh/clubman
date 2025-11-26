import "@/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Clubman",
  description: "Manage your club with ease.",
  manifest: "/manifest.json", // Link the manifest here
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#0a1128", // Must match manifest theme_color
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
