"use client";

import { MessageCircle } from "lucide-react";
import { Section } from "@/components/design";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { whatsappUrl } from "@/lib/contact";
import { useTranslation } from "@/lib/useTranslation";

export default function ContactPage() {
  const { t, language } = useTranslation();

  return (
    <div lang={language}>
      <Section title={t.contact.title} subtitle={t.contact.subtitle} className="pt-12">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-2xl border-border/70 bg-card/85">
            <CardContent className="pt-6">
              <a href={whatsappUrl} className={buttonVariants({ size: "lg", className: "w-full gap-2" })}>
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                {t.contact.whatsapp}
              </a>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}
