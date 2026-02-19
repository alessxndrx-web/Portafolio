"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Filter, FolderSearch } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Section } from "@/components/design";
import { StaggerContainer, StaggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/useLocalStorage";

type ProjectCategory = "dashboard" | "pos" | "cms" | "crm";
type FilterKey = "all" | ProjectCategory;
type ProjectCard = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  demoLink: string;
  category: ProjectCategory;
  imageSrc: string;
  imageAlt: string;
};

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useLocalStorage<FilterKey>("ui_projects_filter", "all");

  const projects: ProjectCard[] = [
    {
      id: "dashboard",
      title: t.projects.dashboardTitle,
      description: t.projects.dashboardDesc,
      tags: [t.projects.tags.dashboard, t.projects.tags.admin, t.projects.tags.analytics],
      demoLink: "/demos/dashboard",
      category: "dashboard",
      imageSrc: "/projects/admin-dashboard.png",
      imageAlt: t.projects.imageAlt.adminDashboard,
    },
    {
      id: "pos",
      title: t.projects.posTitle,
      description: t.projects.posDesc,
      tags: [t.projects.tags.pos, t.projects.tags.ecommerce],
      demoLink: "/demos/pos",
      category: "pos",
      imageSrc: "/projects/mini-pos.png",
      imageAlt: t.projects.imageAlt.miniPos,
    },
    {
      id: "editable",
      title: t.projects.editableTitle,
      description: t.projects.editableDesc,
      tags: [t.projects.tags.landing, t.projects.tags.cms],
      demoLink: "/demos/editable-site",
      category: "cms",
      imageSrc: "/projects/editable-landing.png",
      imageAlt: t.projects.imageAlt.editableLanding,
    },
    {
      id: "crm",
      title: t.projects.crmTitle,
      description: t.projects.crmDesc,
      tags: [t.projects.tags.crm, t.projects.tags.sales, t.projects.tags.pipeline],
      demoLink: "/demos/crm",
      category: "crm",
      imageSrc: "/projects/crm-ventas.png",
      imageAlt: t.projects.imageAlt.crmVentas,
    },
  ];

  const filters = [
    { id: "all" as const, label: t.projects.filters.all },
    { id: "dashboard" as const, label: t.projects.filters.dashboards },
    { id: "crm" as const, label: t.projects.filters.crm },
    { id: "pos" as const, label: t.projects.filters.pos },
    { id: "cms" as const, label: t.projects.filters.cms },
  ];

  const filteredProjects =
    filter === "all" ? projects : projects.filter((project) => project.category === filter);

  return (
    <Section
      title={t.projects.title}
      subtitle={t.projects.subtitle}
      className="pt-12"
      actions={<Filter className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="mb-7 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === item.id
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border/80 bg-card/70 text-muted-foreground hover:border-primary/25 hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title={t.projects.noResultsTitle}
          description={t.projects.noResultsDesc}
          actionLabel={t.projects.clearFilters}
          onAction={() => setFilter("all")}
        />
      ) : (
        <StaggerContainer className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <StaggerItem key={project.id}>
              <motion.article
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/78 shadow-[0_14px_30px_-22px_hsl(var(--foreground)/0.4)] backdrop-blur-sm"
              >
                <div className="relative h-44 overflow-hidden border-b border-border/70">
                  <Image
                    src={project.imageSrc}
                    alt={project.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-300 ease-out group-hover:scale-[1.02] group-hover:contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/15 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-200 group-hover:opacity-100">
                    <Link href={project.demoLink}>
                      <Button className="gap-2 shadow-lg">
                        {t.projects.openDemo}
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </Section>
  );
}
