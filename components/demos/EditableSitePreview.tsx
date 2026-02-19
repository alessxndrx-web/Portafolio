"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section } from "@/components/design";
import { StaggerContainer, StaggerItem } from "@/lib/motion";
import type { EditableContent } from "@/types";

interface EditableSitePreviewProps {
  content: EditableContent;
  editHref?: string;
  editLabel?: string;
  showEditAction?: boolean;
  carouselPrevLabel: string;
  carouselNextLabel: string;
  compact?: boolean;
}

function PreviewImage({
  src,
  alt,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
    />
  );
}

export function EditableSitePreview({
  content,
  editHref = "/demos/editable-site/admin",
  editLabel,
  showEditAction = false,
  carouselPrevLabel,
  carouselNextLabel,
  compact = false,
}: EditableSitePreviewProps) {
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const heroOffset = useTransform(scrollY, [0, 600], [0, -26]);

  const testimonials = useMemo(() => {
    return content.testimonials.items.length
      ? content.testimonials.items
      : [{ name: "", text: "", image: "" }];
  }, [content.testimonials.items]);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[index] ?? testimonials[0];

  return (
    <div className={compact ? "space-y-10" : "space-y-14 pb-12"}>
      <section
        className={
          compact
            ? "relative overflow-hidden rounded-2xl border border-border/70 bg-card/65 px-6 py-10"
            : "relative overflow-hidden px-4 py-16 md:py-20"
        }
      >
        <motion.div
          style={{ y: heroOffset }}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.25),transparent_38%),radial-gradient(circle_at_88%_8%,hsl(var(--accent)/0.22),transparent_34%)]"
        />
        <div className={compact ? "relative" : "relative mx-auto max-w-6xl"}>
          {content.hero.image ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28 }}
            >
              <PreviewImage
                src={content.hero.image}
                alt="Hero"
                width={1600}
                height={960}
                className="mb-6 h-[240px] w-full rounded-2xl border border-border/60 object-cover shadow-lg md:h-[320px]"
              />
            </motion.div>
          ) : null}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.24 }}
            className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl"
            data-testid="editable-public-hero-title"
          >
            {content.hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.24, delay: 0.08 }}
            className="mt-3 max-w-2xl text-lg text-muted-foreground"
          >
            {content.hero.subtitle}
          </motion.p>

          {showEditAction && editLabel ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.24, delay: 0.14 }}
              className="mt-6"
            >
              <Link href={editHref}>
                <Button>{editLabel}</Button>
              </Link>
            </motion.div>
          ) : null}
        </div>
      </section>

      <Section
        title={content.features.title}
        className={compact ? "py-0" : undefined}
        headerClassName={compact ? "mb-5" : undefined}
      >
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {content.features.items.map((feature, itemIndex) => (
            <StaggerItem key={`${feature.title}-${itemIndex}`}>
              <Card className="h-full rounded-2xl border-border/70">
                <CardHeader>
                  {feature.image ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.22 }}
                    >
                      <PreviewImage
                        src={feature.image}
                        alt={feature.title}
                        width={720}
                        height={480}
                        className="mb-3 h-36 w-full rounded-xl border border-border/60 object-cover"
                      />
                    </motion.div>
                  ) : null}
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      <Section
        title={content.testimonials.title}
        className={compact ? "py-0" : undefined}
        actions={
          testimonials.length > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={prev}
                aria-label={carouselPrevLabel}
                data-testid="testimonial-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={next}
                aria-label={carouselNextLabel}
                data-testid="testimonial-next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        }
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-4 md:p-6" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.name}-${index}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24 }}
              className="flex flex-col gap-4 md:flex-row md:items-center"
            >
              {current.image ? (
                <PreviewImage
                  src={current.image}
                  alt={current.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border border-border/70 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/70 bg-secondary text-xl font-semibold">
                  {current.name.slice(0, 1)}
                </div>
              )}
              <div>
                <p className="text-base text-muted-foreground">&ldquo;{current.text}&rdquo;</p>
                <p className="mt-2 text-sm font-semibold">{current.name}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>
    </div>
  );
}
