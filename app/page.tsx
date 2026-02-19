"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Compass,
  Layers,
  Mail,
  Rocket,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { FeatureCard, Section, StatCard } from "@/components/design";
import { shellContainer } from "@/lib/design";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/lib/motion";

export default function Home() {
  const { t } = useTranslation();

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

  const highlights = [
    {
      icon: BarChart3,
      label: t.home.highlight1Title,
      hint: t.home.highlight1Desc,
      value: 42,
      suffix: "+",
    },
    {
      icon: ShoppingCart,
      label: t.home.highlight2Title,
      hint: t.home.highlight2Desc,
      value: 98,
      suffix: "%",
    },
    {
      icon: Sparkles,
      label: t.home.highlight3Title,
      hint: t.home.highlight3Desc,
      value: 96,
      suffix: "%",
    },
  ];

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden py-16 md:py-28">
        <div className={`${shellContainer} relative`}>
          <div className="absolute -left-28 top-8 h-56 w-56 rounded-full bg-primary/30 blur-[90px]" />
          <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-accent/25 blur-[95px]" />
          <div className="relative rounded-3xl border border-white/30 bg-card/70 px-6 py-12 shadow-[0_30px_80px_-48px_hsl(var(--primary)/0.8)] backdrop-blur-xl md:px-12 md:py-14">
            <p className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t.home.heroEyebrow}
            </p>

            <motion.h1
              key={t.home.heroTitle}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="max-w-4xl bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text text-4xl font-semibold leading-[1.06] text-transparent md:text-6xl"
            >
              {t.home.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.2 }}
              className="text-measure mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              {t.home.heroSubtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.28 }}
              className="text-measure mt-2 max-w-2xl text-base text-muted-foreground"
            >
              {t.home.headline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.36 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/projects">
                <Button size="lg" className="gap-2">
                  {t.home.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  {t.home.ctaContact}
                </Button>
              </Link>
            </motion.div>
          </div>
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

      <Section title={t.home.highlights} subtitle={t.home.highlightsIntro}>
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <StaggerItem key={highlight.label}>
              <StatCard
                icon={highlight.icon}
                label={highlight.label}
                hint={highlight.hint}
                value={highlight.value}
                suffix={highlight.suffix}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>
    </div>
  );
}
