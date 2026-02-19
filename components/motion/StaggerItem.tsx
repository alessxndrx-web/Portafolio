"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/lib/motion";

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
