"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, LayoutPanelTop, Rocket, Save } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useEditableWorkspace } from "@/lib/useEditableWorkspace";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EditableSitePreview } from "@/components/demos/EditableSitePreview";
import type { EditableContent } from "@/types";

type SavingMode = "draft" | "publish" | null;

export function EditableSiteAdmin() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [workspace, setWorkspace] = useEditableWorkspace();
  const [localContent, setLocalContent] = useState<EditableContent>(workspace.draft);
  const [splitPreview, setSplitPreview] = useLocalStorage<boolean>("ui_editable_split_preview", true);
  const [savingMode, setSavingMode] = useState<SavingMode>(null);
  const [saveProgress, setSaveProgress] = useState(0);

  useEffect(() => {
    setLocalContent(workspace.draft);
  }, [workspace.draft]);

  const controlsDisabled = savingMode !== null;

  const completeSave = (mode: Exclude<SavingMode, null>) => {
    if (savingMode) {
      return;
    }

    const now = new Date().toISOString();
    setWorkspace((previous) => ({
      ...previous,
      draft: localContent,
      published: mode === "publish" ? localContent : previous.published,
      lastSavedAt: now,
      lastPublishedAt: mode === "publish" ? now : previous.lastPublishedAt,
    }));

    if (mode === "publish") {
      localStorage.setItem("editable_site_content", JSON.stringify(localContent));
    }

    setSavingMode(mode);
    setSaveProgress(8);

    const progressTimer = window.setInterval(() => {
      setSaveProgress((previous) => Math.min(previous + 18, 92));
    }, 120);

    window.setTimeout(() => {
      window.clearInterval(progressTimer);
      setSaveProgress(100);
      showToast(mode === "draft" ? t.editableSite.draftSavedToast : t.editableSite.publishedToast, "success");

      window.setTimeout(() => {
        setSavingMode(null);
        setSaveProgress(0);
      }, 260);
    }, 920);
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    section: "hero" | "features" | "testimonials",
    index?: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = String(reader.result || "");
      if (section === "hero") {
        setLocalContent((previous) => ({
          ...previous,
          hero: {
            ...previous.hero,
            image: base64,
          },
        }));
        return;
      }

      if (section === "features" && index !== undefined) {
        setLocalContent((previous) => {
          const items = [...previous.features.items];
          items[index] = { ...items[index], image: base64 };
          return {
            ...previous,
            features: {
              ...previous.features,
              items,
            },
          };
        });
        return;
      }

      if (section === "testimonials" && index !== undefined) {
        setLocalContent((previous) => {
          const items = [...previous.testimonials.items];
          items[index] = { ...items[index], image: base64 };
          return {
            ...previous,
            testimonials: {
              ...previous.testimonials,
              items,
            },
          };
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const heroImage = useMemo(() => localContent.hero.image, [localContent.hero.image]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{t.editableSite.admin}</h1>
          <p className="text-sm text-muted-foreground">{t.editableSite.splitPreview}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-secondary/30 px-2 py-1">
              {t.editableSite.lastSaved}: {workspace.lastSavedAt ? new Date(workspace.lastSavedAt).toLocaleString() : "-"}
            </span>
            <span className="rounded-full border border-border/70 bg-secondary/30 px-2 py-1">
              {t.editableSite.lastPublished}: {workspace.lastPublishedAt ? new Date(workspace.lastPublishedAt).toLocaleString() : "-"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setSplitPreview((previous) => !previous)}
            className="gap-2"
            disabled={controlsDisabled}
          >
            <LayoutPanelTop className="h-4 w-4" />
            {t.editableSite.splitPreview}
          </Button>

          <Link href="/demos/editable-site">
            <Button variant="secondary" className="gap-2" disabled={controlsDisabled}>
              <Eye className="h-4 w-4" />
              {t.editableSite.preview}
            </Button>
          </Link>

          <Button
            onClick={() => completeSave("draft")}
            disabled={controlsDisabled}
            className="gap-2"
            variant="secondary"
            data-testid="editable-save-draft"
          >
            <Save className="h-4 w-4" />
            {savingMode === "draft" ? t.editableSite.saving : t.editableSite.saveDraft}
          </Button>

          <Button
            onClick={() => completeSave("publish")}
            disabled={controlsDisabled}
            className="gap-2"
            data-testid="editable-publish"
          >
            <Rocket className="h-4 w-4" />
            {savingMode === "publish" ? t.editableSite.saving : t.editableSite.publish}
          </Button>
        </div>
      </div>

      {savingMode ? (
        <div className="mb-4 overflow-hidden rounded-full border border-border/70 bg-secondary/50" aria-live="polite">
          <motion.div
            className="h-2 bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${saveProgress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      ) : null}

      <div className={splitPreview ? "grid gap-4 xl:grid-cols-[1.05fr_0.95fr]" : "space-y-4"}>
        <div className="space-y-4">
          <Card className="rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle>{t.editableSite.heroSection}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label htmlFor="editable-hero-title" className="mb-1.5 block text-sm font-medium">
                  {t.editableSite.hero.title}
                </label>
                <Input
                  id="editable-hero-title"
                  data-testid="editable-hero-title-input"
                  value={localContent.hero.title}
                  onChange={(event) =>
                    setLocalContent((previous) => ({
                      ...previous,
                      hero: {
                        ...previous.hero,
                        title: event.target.value,
                      },
                    }))
                  }
                  disabled={controlsDisabled}
                />
              </div>
              <div>
                <label htmlFor="editable-hero-subtitle" className="mb-1.5 block text-sm font-medium">
                  {t.editableSite.hero.subtitle}
                </label>
                <Input
                  id="editable-hero-subtitle"
                  value={localContent.hero.subtitle}
                  onChange={(event) =>
                    setLocalContent((previous) => ({
                      ...previous,
                      hero: {
                        ...previous.hero,
                        subtitle: event.target.value,
                      },
                    }))
                  }
                  disabled={controlsDisabled}
                />
              </div>
              <div>
                <label htmlFor="editable-hero-image" className="mb-1.5 block text-sm font-medium">
                  {t.editableSite.uploadImage}
                </label>
                <Input
                  id="editable-hero-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, "hero")}
                  disabled={controlsDisabled}
                />
              </div>
              {heroImage ? (
                <motion.div
                  key={heroImage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <Image
                    src={heroImage}
                    alt="Hero preview"
                    width={1280}
                    height={720}
                    unoptimized
                    className="h-44 w-full rounded-xl border border-border/70 object-cover"
                  />
                </motion.div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle>{t.editableSite.featuresSection}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="editable-features-title" className="mb-1.5 block text-sm font-medium">
                  {t.editableSite.features.title}
                </label>
                <Input
                  id="editable-features-title"
                  value={localContent.features.title}
                  onChange={(event) =>
                    setLocalContent((previous) => ({
                      ...previous,
                      features: {
                        ...previous.features,
                        title: event.target.value,
                      },
                    }))
                  }
                  disabled={controlsDisabled}
                />
              </div>

              {localContent.features.items.map((feature, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-border/70 bg-secondary/25 p-3">
                  <div>
                    <label htmlFor={`editable-feature-title-${index}`} className="mb-1.5 block text-sm font-medium">
                      {t.editableSite.features.feature1} {index + 1}
                    </label>
                    <Input
                      id={`editable-feature-title-${index}`}
                      value={feature.title}
                      onChange={(event) => {
                        setLocalContent((previous) => {
                          const items = [...previous.features.items];
                          items[index] = {
                            ...items[index],
                            title: event.target.value,
                          };
                          return {
                            ...previous,
                            features: {
                              ...previous.features,
                              items,
                            },
                          };
                        });
                      }}
                      disabled={controlsDisabled}
                    />
                  </div>
                  <div>
                    <label htmlFor={`editable-feature-description-${index}`} className="mb-1.5 block text-sm font-medium">
                      {t.editableSite.fieldDescription}
                    </label>
                    <textarea
                      id={`editable-feature-description-${index}`}
                      value={feature.description}
                      onChange={(event) => {
                        setLocalContent((previous) => {
                          const items = [...previous.features.items];
                          items[index] = {
                            ...items[index],
                            description: event.target.value,
                          };
                          return {
                            ...previous,
                            features: {
                              ...previous.features,
                              items,
                            },
                          };
                        });
                      }}
                      disabled={controlsDisabled}
                      className="min-h-[90px] w-full rounded-xl border border-input/90 bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor={`editable-feature-image-${index}`} className="mb-1.5 block text-sm font-medium">
                      {t.editableSite.uploadImage}
                    </label>
                    <Input
                      id={`editable-feature-image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event, "features", index)}
                      disabled={controlsDisabled}
                    />
                  </div>
                  {feature.image ? (
                    <motion.div
                      key={feature.image}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={720}
                        height={480}
                        unoptimized
                        className="h-32 w-full rounded-xl border border-border/70 object-cover"
                      />
                    </motion.div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle>{t.editableSite.testimonialsSection}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="editable-testimonials-title" className="mb-1.5 block text-sm font-medium">
                  {t.editableSite.testimonials.title}
                </label>
                <Input
                  id="editable-testimonials-title"
                  value={localContent.testimonials.title}
                  onChange={(event) =>
                    setLocalContent((previous) => ({
                      ...previous,
                      testimonials: {
                        ...previous.testimonials,
                        title: event.target.value,
                      },
                    }))
                  }
                  disabled={controlsDisabled}
                />
              </div>

              {localContent.testimonials.items.map((item, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-border/70 bg-secondary/25 p-3">
                  <div>
                    <label htmlFor={`editable-testimonial-name-${index}`} className="mb-1.5 block text-sm font-medium">
                      {t.editableSite.fieldName}
                    </label>
                    <Input
                      id={`editable-testimonial-name-${index}`}
                      value={item.name}
                      onChange={(event) => {
                        setLocalContent((previous) => {
                          const items = [...previous.testimonials.items];
                          items[index] = {
                            ...items[index],
                            name: event.target.value,
                          };
                          return {
                            ...previous,
                            testimonials: {
                              ...previous.testimonials,
                              items,
                            },
                          };
                        });
                      }}
                      disabled={controlsDisabled}
                    />
                  </div>
                  <div>
                    <label htmlFor={`editable-testimonial-text-${index}`} className="mb-1.5 block text-sm font-medium">
                      {t.editableSite.fieldText}
                    </label>
                    <textarea
                      id={`editable-testimonial-text-${index}`}
                      value={item.text}
                      onChange={(event) => {
                        setLocalContent((previous) => {
                          const items = [...previous.testimonials.items];
                          items[index] = {
                            ...items[index],
                            text: event.target.value,
                          };
                          return {
                            ...previous,
                            testimonials: {
                              ...previous.testimonials,
                              items,
                            },
                          };
                        });
                      }}
                      disabled={controlsDisabled}
                      className="min-h-[90px] w-full rounded-xl border border-input/90 bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor={`editable-testimonial-image-${index}`} className="mb-1.5 block text-sm font-medium">
                      {t.editableSite.uploadImage}
                    </label>
                    <Input
                      id={`editable-testimonial-image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event, "testimonials", index)}
                      disabled={controlsDisabled}
                    />
                  </div>
                  {item.image ? (
                    <motion.div
                      key={item.image}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 rounded-full border border-border/70 object-cover"
                      />
                    </motion.div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {splitPreview ? (
          <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <div className="rounded-2xl border border-border/70 bg-card/55 p-3">
              <EditableSitePreview
                content={localContent}
                compact
                carouselPrevLabel={t.editableSite.carouselPrev}
                carouselNextLabel={t.editableSite.carouselNext}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
