"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RouteTransition } from "@/lib/motion";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.14),transparent_36%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.13),transparent_32%),radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.08),transparent_48%)]"
      />
      <Navbar />
      <main className="relative z-10 flex-1">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <Footer />
    </div>
  );
}
