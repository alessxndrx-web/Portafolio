import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { shellContainer, sectionSpacing } from "@/lib/design";
import { RevealInView } from "@/lib/motion";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  actions,
  className,
  headerClassName,
  contentClassName,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn(sectionSpacing, className)}>
      <div className={shellContainer}>
        <RevealInView className={cn("mb-9 flex flex-wrap items-end justify-between gap-4", headerClassName)}>
          <div className="max-w-3xl space-y-2.5">
            {eyebrow ? (
              <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-[2rem] font-semibold tracking-tight md:text-[2.45rem]">{title}</h2>
            {subtitle ? <p className="text-measure text-base text-muted-foreground md:text-lg">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </RevealInView>
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
}
