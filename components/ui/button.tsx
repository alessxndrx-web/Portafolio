import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.99] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-[0_10px_22px_-12px_hsl(var(--primary)/0.9)] hover:translate-y-[-1px] hover:brightness-105",
        primary:
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-[0_10px_22px_-12px_hsl(var(--primary)/0.9)] hover:translate-y-[-1px] hover:brightness-105",
        secondary:
          "border border-border/80 bg-secondary/85 text-secondary-foreground hover:-translate-y-[1px] hover:border-primary/35 hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        outline:
          "border border-border/80 bg-background/80 text-foreground hover:border-primary/35 hover:bg-secondary/60",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_20px_-12px_hsl(var(--destructive)/0.8)] hover:brightness-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
