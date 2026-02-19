"use client";

import { useTranslation } from "@/lib/useTranslation";
import { Section } from "@/components/design";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  const { t } = useTranslation();

  const skills = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "UX Systems", "A11y"];
  const aboutParagraphs = [t.about.paragraph1, t.about.paragraph2, t.about.paragraph3, t.about.paragraph4];

  return (
    <Section title={t.about.title} subtitle={t.about.subtitle} className="pt-12">
      <div className="mx-auto max-w-4xl">
        <Card className="rounded-2xl border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{t.about.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="max-w-3xl space-y-5">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-measure text-base leading-relaxed text-muted-foreground md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <div>
              <h2 className="mb-3 text-xl font-semibold tracking-tight">{t.about.skills}</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
