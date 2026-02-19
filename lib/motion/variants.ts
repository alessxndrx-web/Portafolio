import type { Transition, Variants } from "framer-motion";

export const motionDurations = {
  fast: 0.18,
  normal: 0.24,
  slow: 0.32,
} as const;

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const pageTransition: Transition = {
  duration: motionDurations.normal,
  ease: motionEase,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDurations.normal,
      ease: motionEase,
    },
  },
};

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDurations.slow,
      ease: motionEase,
    },
  },
};

export const microInteraction = {
  cardHover: { scale: 1.02, y: -4 },
  buttonHover: { scale: 1.02 },
  iconWiggle: {
    rotate: [0, -8, 6, -4, 0],
    transition: {
      duration: 0.3,
      ease: motionEase,
    },
  },
} as const;
