import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/lib/useTranslation";
import { AuthProvider } from "@/lib/useAuth";
import { ToastProvider } from "@/components/ui/toast";
import { AppShell } from "@/components/layout/AppShell";
import { StorageMigrator } from "@/components/StorageMigrator";
import { SpeedInsights } from "@vercel/speed-insights/next";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Developer Portfolio",
  description: "Full-stack developer portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable}`}>
        <TranslationProvider>
          <AuthProvider>
            <ToastProvider>
              <StorageMigrator />
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthProvider>
        </TranslationProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
