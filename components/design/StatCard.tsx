"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CountUp } from "@/components/motion/CountUp";
import { cn } from "@/lib/utils";
import { motionDurations, motionEase, microInteraction } from "@/lib/motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  hint?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  decimals,
  hint,
  className,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={microInteraction.cardHover}
      transition={{ duration: motionDurations.fast, ease: motionEase }}
      className={cn("group", className)}
    >
      <Card className="relative h-full overflow-hidden border-white/50 bg-card/90 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,hsl(var(--accent)/0.16),transparent_46%),radial-gradient(circle_at_0%_100%,hsl(var(--primary)/0.15),transparent_42%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-secondary/75 text-primary shadow-sm">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-3xl font-semibold tracking-tight">
            <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} duration={1.2} />
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
