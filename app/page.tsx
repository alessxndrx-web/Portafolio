"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Compass,
  Layers,
  Mail,
  Rocket,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { FeatureCard, Section } from "@/components/design";
import { shellContainer } from "@/lib/design";
import { buttonVariants } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/lib/motion";
import styles from "./home.module.css";

const monogram = [
  "0110 1110",
  "1001 1001",
  "1111 1110",
  "1001 1001",
  "1001 1110",
];

function HeroMonogram() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.mark}>
        {monogram.flatMap((line, row) =>
          Array.from(line, (pixel, column) =>
            pixel === "1" ? (
              <span
                key={row * line.length + column}
                className={styles.block}
                style={{
                  gridArea: `${row + 1} / ${column + 1}`,
                  "--light-at": column < 3 ? "480ms" : column < 6 ? "935ms" : "1390ms",
                } as CSSProperties}
              />
            ) : null
          )
        )}
      </div>

      <div className={styles.cube}>
        <span className={styles.front} />
        <span className={styles.back} />
        <span className={styles.right} />
        <span className={styles.left} />
        <span className={styles.top} />
        <span className={styles.bottom} />
      </div>
    </div>
  );
}


export default function Home() {
  const { t, language } = useTranslation();

  const process = [
    {
      icon: Compass,
      title: t.home.processStep1Title,
      description: t.home.processStep1Desc,
    },
    {
      icon: Layers,
      title: t.home.processStep2Title,
      description: t.home.processStep2Desc,
    },
    {
      icon: Rocket,
      title: t.home.processStep3Title,
      description: t.home.processStep3Desc,
    },
  ];

  const services = [
    {
      icon: BarChart3,
      title: t.home.service1Title,
      description: t.home.service1Desc,
    },
    {
      icon: Sparkles,
      title: t.home.service2Title,
      description: t.home.service2Desc,
    },
    {
      icon: Briefcase,
      title: t.home.service3Title,
      description: t.home.service3Desc,
    },
  ];

  const featured = [
    {
      name: "PsicoCare",
      image: "/projects/psicocare.webp",
      ...t.home.psicocare,
    },
    {
      name: "MotoMas",
      image: "/projects/motomas.webp",
      ...t.home.motomas,
    },
  ];

  return (
    <div lang={language} className="pb-12">
      <section className="pb-9 pt-8 md:pb-14 md:pt-14" aria-labelledby="home-title">
        <div className={shellContainer}>
          <div className="grid items-center gap-7 rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_30px_80px_-48px_hsl(var(--primary)/0.6)] backdrop-blur-xl sm:p-8 md:grid-cols-[1.05fr_1fr] md:gap-9 lg:gap-12 lg:p-11">
            <div className="min-w-0">
              <div className={styles.copy}>
                <p className="mb-3 text-sm font-bold tracking-wide text-primary sm:text-base">
                  Alessandro Barrios
                </p>
                <h1
                  id="home-title"
                  className="text-[clamp(2rem,4.55vw,3.6rem)] font-semibold leading-[1.07]"
                >
                  {t.home.heroTitle}
                </h1>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7">
                <Link href="/projects" className={buttonVariants({ className: "gap-2 sm:h-12 sm:px-5" })}>
                  {t.home.cta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link href="/contact" className={buttonVariants({ variant: "secondary", className: "gap-2 sm:h-12 sm:px-5" })}>
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  {t.home.ctaContact}
                </Link>
              </div>
            </div>

            <HeroMonogram />
          </div>
        </div>
      </section>

      <section className={`${shellContainer} pb-10 md:pb-14`} aria-labelledby="featured-projects">
        <h2 id="featured-projects" className="mb-5 text-3xl font-semibold tracking-tight md:mb-7 md:text-4xl">
          {t.home.featuredTitle}
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {featured.map((project) => (
            <article key={project.name} className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
              <Image
                src={project.image}
                alt={project.imageAlt}
                width={1200}
                height={750}
                sizes="(min-width: 1152px) 542px, (min-width: 768px) 48vw, 94vw"
                className="block h-auto w-full border-b border-border/70 bg-muted"
              />
              <div className="space-y-2 px-5 py-5 sm:px-6">
                <h3 className="text-2xl font-semibold">{project.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Section
        title={t.home.processTitle}
        subtitle={t.home.processSubtitle}
        className="pt-6"
      >
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {process.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.title}>
                <div className="surface-card interactive-lift rounded-2xl p-6">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </Section>

      <Section title={t.home.services}>
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.title}>
              <FeatureCard icon={service.icon} title={service.title} description={service.description} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

    </div>
  );
}
