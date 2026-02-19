"use client";

import { useTranslation } from "@/lib/useTranslation";
import { shellContainer } from "@/lib/design";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-8 border-t border-border/70 bg-background/70 backdrop-blur-xl">
      <div className={`${shellContainer} py-6`}>
        <div className="flex items-center justify-center text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Portfolio. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
