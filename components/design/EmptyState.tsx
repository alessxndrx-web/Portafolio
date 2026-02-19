import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border/80 bg-card/75">
      <CardContent className="flex flex-col items-center gap-3 py-11 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/25 opacity-90" />
          <Icon className="relative z-10 h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold tracking-tight">{title}</p>
          <p className="text-measure text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
