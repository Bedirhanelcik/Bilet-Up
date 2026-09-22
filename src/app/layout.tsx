import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreProvider } from "@/redux/StoreProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "BiletUP",
    template: "%s — BiletUP",
  },
  description:
    "BiletUP is an event discovery and management platform — find events, get tickets, and follow organizers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <StoreProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Header />
                  <main className="flex flex-1 flex-col">{children}</main>
                  <Footer />
                </TooltipProvider>
              </AuthProvider>
            </StoreProvider>
            <Toaster />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
