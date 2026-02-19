"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { revealVariants } from "@/lib/motion";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.28, className }: FadeInProps) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
