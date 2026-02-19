"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motionDurations, motionEase, microInteraction } from "@/lib/motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={microInteraction.cardHover}
      transition={{ duration: motionDurations.fast, ease: motionEase }}
      className={cn("group relative", className)}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/35 via-primary/10 to-accent/35 opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100" />
      <Card className="relative h-full overflow-hidden border-white/45 bg-card/85 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.2),transparent_45%),radial-gradient(circle_at_95%_90%,hsl(var(--accent)/0.16),transparent_40%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <CardHeader className="relative z-10">
          <motion.div
            whileHover={{ rotate: [0, -8, 6, -4, 0] }}
            transition={{ duration: 0.3, ease: motionEase }}
            className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
          >
            <Icon className="h-5 w-5" />
          </motion.div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-0">
          <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
