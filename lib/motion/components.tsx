"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  pageTransition,
  pageVariants,
  revealVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion/variants";

type ChildrenProps = {
  children: ReactNode;
  className?: string;
};

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial={pathname === "/" ? false : "initial"}
      animate="animate"
      transition={pageTransition}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}

export function RevealInView({
  children,
  className,
  ...props
}: ChildrenProps & HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  ...props
}: ChildrenProps & HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: ChildrenProps & HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
