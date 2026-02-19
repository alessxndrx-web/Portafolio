"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Filter,
  GripVertical,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, StatCard } from "@/components/design";
import { StaggerContainer, StaggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

type DealStage = "lead" | "qualified" | "proposal" | "won" | "lost";
type DealFilter = "all" | "mine" | "highValue" | "stale" | "won";
type DensityMode = "cozy" | "compact";

type DealTask = {
  id: string;
  title: string;
  done: boolean;
};

type DealEvent = {
  id: string;
  text: string;
  date: string;
};

type CRMDeal = {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: DealStage;
  owner: string;
  source: string;
  nextAction: string;
  email: string;
  updatedAt: string;
  tasks: DealTask[];
  events: DealEvent[];
};

type SavedView = {
  id: string;
  name: string;
  filter: DealFilter;
  query: string;
};

type MoveSnapshot = {
  dealId: string;
  from: DealStage;
  to: DealStage;
};

const STALE_DAYS = 10;
const HIGH_VALUE_THRESHOLD = 20000;
const CURRENT_OWNER = "Alex";
const STAGE_ORDER: DealStage[] = ["lead", "qualified", "proposal", "won", "lost"];

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const defaultDeals: CRMDeal[] = [
  {
    id: "deal-1",
    title: "Platform Expansion",
    company: "Northwind Labs",
    value: 38000,
    stage: "proposal",
    owner: "Alex",
    source: "Inbound",
    nextAction: "Pricing review meeting",
    email: "ops@northwindlabs.com",
    updatedAt: daysAgo(2),
    tasks: [
      { id: "task-1", title: "Share technical scope", done: false },
      { id: "task-2", title: "Legal review", done: true },
    ],
    events: [
      { id: "evt-1", text: "Proposal sent to stakeholder team", date: daysAgo(1) },
      { id: "evt-2", text: "Discovery workshop completed", date: daysAgo(4) },
    ],
  },
  {
    id: "deal-2",
    title: "CRM Migration",
    company: "Atlas Retail",
    value: 22400,
    stage: "qualified",
    owner: "Maria",
    source: "Referral",
    nextAction: "Validate integration plan",
    email: "cto@atlasretail.io",
    updatedAt: daysAgo(5),
    tasks: [{ id: "task-3", title: "Prepare migration timeline", done: false }],
    events: [{ id: "evt-3", text: "Technical qualification call held", date: daysAgo(5) }],
  },
  {
    id: "deal-3",
    title: "New POS Rollout",
    company: "Meridian Stores",
    value: 17400,
    stage: "lead",
    owner: "Alex",
    source: "Outbound",
    nextAction: "First demo with operations team",
    email: "ops@meridianstores.com",
    updatedAt: daysAgo(12),
    tasks: [{ id: "task-4", title: "Send ROI estimate", done: false }],
    events: [{ id: "evt-4", text: "Lead imported from outbound campaign", date: daysAgo(12) }],
  },
  {
    id: "deal-4",
    title: "Support Portal",
    company: "Fjord Telecom",
    value: 12800,
    stage: "won",
    owner: "Maria",
    source: "Inbound",
    nextAction: "Kickoff onboarding",
    email: "it@fjordtelecom.com",
    updatedAt: daysAgo(3),
    tasks: [{ id: "task-5", title: "Schedule onboarding workshop", done: false }],
    events: [{ id: "evt-5", text: "Contract signed", date: daysAgo(3) }],
  },
  {
    id: "deal-5",
    title: "Analytics Upgrade",
    company: "Blueport Finance",
    value: 31000,
    stage: "lost",
    owner: "Alex",
    source: "Partner",
    nextAction: "Quarterly reactivation sequence",
    email: "growth@blueport.finance",
    updatedAt: daysAgo(7),
    tasks: [{ id: "task-6", title: "Create reactivation campaign", done: false }],
    events: [{ id: "evt-6", text: "Deal marked as lost due to budget cycle", date: daysAgo(7) }],
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isStaleDeal(updatedAt: string) {
  const updated = new Date(updatedAt).getTime();
  const staleAfter = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  return updated < staleAfter;
}

function BoardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="rounded-2xl border-border/70 p-4">
          <div className="h-5 w-24 animate-pulse rounded bg-secondary/55" />
          <div className="mt-4 space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-secondary/55" />
            <div className="h-24 animate-pulse rounded-xl bg-secondary/55" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CRMContent() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [deals, setDeals] = useLocalStorage<CRMDeal[]>("crm_deals", defaultDeals);
  const [activeFilter, setActiveFilter] = useLocalStorage<DealFilter>("ui_crm_filter", "all");
  const [density, setDensity] = useLocalStorage<DensityMode>("ui_crm_density", "cozy");
  const [savedViews, setSavedViews] = useLocalStorage<SavedView[]>("crm_saved_views", []);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<DealStage | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [viewName, setViewName] = useState("");

  const [newNote, setNewNote] = useState("");
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 640);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const needsShapeFix = deals.some((deal) => !Array.isArray(deal.tasks) || !Array.isArray(deal.events));
    if (!needsShapeFix) {
      return;
    }

    setDeals((previous) =>
      previous.map((deal) => ({
        ...deal,
        tasks: Array.isArray(deal.tasks) ? deal.tasks : [],
        events: Array.isArray(deal.events) ? deal.events : [],
      }))
    );
  }, [deals, setDeals]);

  const stageLabels: Record<DealStage, string> = {
    lead: t.crm.stages.lead,
    qualified: t.crm.stages.qualified,
    proposal: t.crm.stages.proposal,
    won: t.crm.stages.won,
    lost: t.crm.stages.lost,
  };

  const filterOptions = [
    { id: "all" as const, label: t.crm.filterAll },
    { id: "mine" as const, label: t.crm.filterMine },
    { id: "highValue" as const, label: t.crm.filterHighValue },
    { id: "stale" as const, label: t.crm.filterStale },
    { id: "won" as const, label: t.crm.filterWon },
  ];

  const filteredDeals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return deals.filter((deal) => {
      const matchesFilter = (() => {
        if (activeFilter === "all") {
          return true;
        }
        if (activeFilter === "mine") {
          return deal.owner === CURRENT_OWNER;
        }
        if (activeFilter === "highValue") {
          return deal.value >= HIGH_VALUE_THRESHOLD;
        }
        if (activeFilter === "stale") {
          return isStaleDeal(deal.updatedAt);
        }
        if (activeFilter === "won") {
          return deal.stage === "won";
        }
        return true;
      })();

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = `${deal.title} ${deal.company} ${deal.owner} ${deal.source}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [activeFilter, deals, searchTerm]);

  const dealsByStage = useMemo(() => {
    return STAGE_ORDER.reduce((acc, stage) => {
      acc[stage] = filteredDeals
        .filter((deal) => deal.stage === stage)
        .sort((a, b) => b.value - a.value);
      return acc;
    }, {} as Record<DealStage, CRMDeal[]>);
  }, [filteredDeals]);

  const selectedDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  const stats = useMemo(() => {
    const openDeals = deals.filter((deal) => deal.stage !== "won" && deal.stage !== "lost");
    const wonDeals = deals.filter((deal) => deal.stage === "won");
    const lostDeals = deals.filter((deal) => deal.stage === "lost");

    const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
    const forecast = deals.reduce((sum, deal) => {
      if (deal.stage === "won") {
        return sum + deal.value;
      }
      if (deal.stage === "proposal") {
        return sum + deal.value * 0.72;
      }
      if (deal.stage === "qualified") {
        return sum + deal.value * 0.48;
      }
      if (deal.stage === "lead") {
        return sum + deal.value * 0.2;
      }
      return sum;
    }, 0);

    const winRateBase = wonDeals.length + lostDeals.length;
    const winRate = winRateBase ? Math.round((wonDeals.length / winRateBase) * 100) : 0;

    return { pipelineValue, forecast, winRate, openDeals: openDeals.length };
  }, [deals]);

  const moveDeal = (dealId: string, nextStage: DealStage) => {
    const currentDeal = deals.find((deal) => deal.id === dealId);
    if (!currentDeal || currentDeal.stage === nextStage) {
      return;
    }

    const snapshot: MoveSnapshot = {
      dealId,
      from: currentDeal.stage,
      to: nextStage,
    };

    const now = new Date().toISOString();
    setDeals((previous) =>
      previous.map((deal) => {
        if (deal.id !== dealId) {
          return deal;
        }

        const movedEvent: DealEvent = {
          id: Math.random().toString(36).slice(2, 9),
          text: `${t.crm.timelineMoved} ${stageLabels[nextStage]}`,
          date: now,
        };

        const nextEvents = [movedEvent, ...deal.events];
        let nextTasks = deal.tasks;

        if (nextStage === "won" && deal.stage !== "won") {
          const onboardingTask: DealTask = {
            id: Math.random().toString(36).slice(2, 9),
            title: "Start onboarding sequence",
            done: false,
          };

          nextTasks = [onboardingTask, ...deal.tasks];
          nextEvents.unshift({
            id: Math.random().toString(36).slice(2, 9),
            text: t.crm.automationWon,
            date: now,
          });
        }

        return {
          ...deal,
          stage: nextStage,
          updatedAt: now,
          tasks: nextTasks,
          events: nextEvents,
        };
      })
    );

    showToast(`${t.crm.movedTo} ${stageLabels[nextStage]}`, "success", {
      actionLabel: t.common.undo,
      onAction: () => {
        setDeals((previous) =>
          previous.map((deal) =>
            deal.id === snapshot.dealId
              ? {
                  ...deal,
                  stage: snapshot.from,
                  updatedAt: new Date().toISOString(),
                  events: [
                    {
                      id: Math.random().toString(36).slice(2, 9),
                      text: t.crm.moveReverted,
                      date: new Date().toISOString(),
                    },
                    ...deal.events,
                  ],
                }
              : deal
          )
        );
        showToast(t.crm.moveReverted, "success");
      },
    });
  };

  const addNoteToDeal = () => {
    if (!selectedDeal || !newNote.trim()) {
      return;
    }

    const now = new Date().toISOString();
    setDeals((previous) =>
      previous.map((deal) =>
        deal.id === selectedDeal.id
          ? {
              ...deal,
              updatedAt: now,
              events: [
                {
                  id: Math.random().toString(36).slice(2, 9),
                  text: newNote.trim(),
                  date: now,
                },
                ...deal.events,
              ],
            }
          : deal
      )
    );

    setNewNote("");
    showToast(t.crm.noteAdded, "success");
  };

  const addTaskToDeal = () => {
    if (!selectedDeal || !newTask.trim()) {
      return;
    }

    const taskTitle = newTask.trim();
    const now = new Date().toISOString();

    setDeals((previous) =>
      previous.map((deal) =>
        deal.id === selectedDeal.id
          ? {
              ...deal,
              updatedAt: now,
              tasks: [{ id: Math.random().toString(36).slice(2, 9), title: taskTitle, done: false }, ...deal.tasks],
              events: [
                {
                  id: Math.random().toString(36).slice(2, 9),
                  text: `Task: ${taskTitle}`,
                  date: now,
                },
                ...deal.events,
              ],
            }
          : deal
      )
    );

    setNewTask("");
    showToast(t.crm.taskAdded, "success");
  };

  const toggleTask = (taskId: string) => {
    if (!selectedDeal) {
      return;
    }

    setDeals((previous) =>
      previous.map((deal) => {
        if (deal.id !== selectedDeal.id) {
          return deal;
        }

        return {
          ...deal,
          updatedAt: new Date().toISOString(),
          tasks: deal.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
        };
      })
    );
  };

  const saveCurrentView = () => {
    const name = viewName.trim();
    if (!name) {
      showToast(t.crm.fillViewName, "error");
      return;
    }

    const nextView: SavedView = {
      id: Math.random().toString(36).slice(2, 9),
      name,
      filter: activeFilter,
      query: searchTerm,
    };

    setSavedViews((previous) => [nextView, ...previous].slice(0, 6));
    setSaveViewOpen(false);
    setViewName("");
    showToast(t.crm.viewSaved, "success");
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
      <Card className="rounded-2xl border-border/70 bg-card/78">
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">{t.crm.title}</h1>
              <p className="text-measure mt-1 text-sm text-muted-foreground md:text-base">{t.crm.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-xl border border-border/70 bg-secondary/40 p-1">
                <button
                  type="button"
                  aria-pressed={density === "cozy"}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                    density === "cozy" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDensity("cozy")}
                >
                  {t.crm.densityCozy}
                </button>
                <button
                  type="button"
                  aria-pressed={density === "compact"}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                    density === "compact"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDensity("compact")}
                >
                  {t.crm.densityCompact}
                </button>
              </div>

              <Button variant="secondary" className="gap-2" onClick={() => setSaveViewOpen(true)}>
                <LayoutGrid className="h-4 w-4" />
                {t.crm.saveView}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t.crm.searchPlaceholder}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={activeFilter === item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
                    activeFilter === item.id
                      ? "border-primary/35 bg-primary/15 text-primary"
                      : "border-border/80 bg-secondary/35 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                {t.crm.savedViews}
              </p>
              {savedViews.length > 0 ? (
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4"
                  onClick={() => setSavedViews([])}
                >
                  {t.crm.clearSavedViews}
                </button>
              ) : null}
            </div>
            {savedViews.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t.crm.noSavedViews}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {savedViews.map((view) => (
                  <div key={view.id} className="inline-flex items-center rounded-full border border-border/70 bg-background/70 pr-1">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold"
                      onClick={() => {
                        setActiveFilter(view.filter);
                        setSearchTerm(view.query);
                        showToast(t.crm.viewApplied, "success");
                      }}
                    >
                      {view.name}
                    </button>
                    <button
                      type="button"
                      aria-label={t.common.close}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      onClick={() => setSavedViews((previous) => previous.filter((entry) => entry.id !== view.id))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <StatCard icon={CircleDollarSign} label={t.crm.statsPipeline} value={stats.pipelineValue} prefix="$" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={Target} label={t.crm.statsForecast} value={stats.forecast} prefix="$" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={Sparkles} label={t.crm.statsWinRate} value={stats.winRate} suffix="%" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={BarChart3} label={t.crm.statsOpenDeals} value={stats.openDeals} />
          </StaggerItem>
        </StaggerContainer>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">{t.crm.loadingBoard}</p>
            <BoardSkeleton />
          </div>
        ) : filteredDeals.length === 0 ? (
          <EmptyState
            icon={Filter}
            title={t.projects.noResultsTitle}
            description={t.projects.noResultsDesc}
            actionLabel={t.projects.clearFilters}
            onAction={() => {
              setActiveFilter("all");
              setSearchTerm("");
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {STAGE_ORDER.map((stage) => (
              <Card
                key={stage}
                className={cn(
                  "rounded-2xl border-border/70 bg-card/76 transition-colors",
                  dropStage === stage ? "border-primary/45 bg-primary/5" : ""
                )}
                onDragOver={(event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  setDropStage(stage);
                }}
                onDragLeave={(event: DragEvent<HTMLDivElement>) => {
                  const nextTarget = event.relatedTarget as Node | null;
                  if (nextTarget && event.currentTarget.contains(nextTarget)) {
                    return;
                  }
                  setDropStage(null);
                }}
                onDrop={(event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  const droppedId = event.dataTransfer.getData("text/plain") || draggedDealId;
                  if (droppedId) {
                    moveDeal(droppedId, stage);
                  }
                  setDraggedDealId(null);
                  setDropStage(null);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{stageLabels[stage]}</CardTitle>
                    <Badge variant="secondary">{dealsByStage[stage].length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0">
                  {dealsByStage[stage].length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 bg-background/50 px-3 py-4 text-center text-xs text-muted-foreground">
                      {t.crm.stageDropHint}
                    </div>
                  ) : (
                    dealsByStage[stage].map((deal) => {
                      const stale = isStaleDeal(deal.updatedAt);
                      const highValue = deal.value >= HIGH_VALUE_THRESHOLD;
                      const spacing = density === "compact" ? "p-3" : "p-3.5";

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(event: DragEvent<HTMLDivElement>) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", deal.id);
                            setDraggedDealId(deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedDealId(null);
                            setDropStage(null);
                          }}
                          className={cn(
                            "interactive-lift cursor-grab rounded-xl border border-border/70 bg-background/80",
                            spacing
                          )}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className={cn("font-semibold tracking-tight", density === "compact" ? "text-sm" : "text-[15px]")}>
                                {deal.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{deal.company}</p>
                            </div>
                            <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {highValue ? (
                              <Badge variant="secondary" className="border-primary/30 bg-primary/12 text-primary">
                                {t.crm.highValueBadge}
                              </Badge>
                            ) : null}
                            {stale ? (
                              <Badge variant="secondary" className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                {t.crm.staleBadge}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(deal.value)}</span>
                            <span>{deal.owner}</span>
                          </div>

                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                            onClick={() => setSelectedDealId(deal.id)}
                          >
                            <UserRound className="h-3.5 w-3.5" />
                            {t.crm.openDrawer}
                          </button>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDeal ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1.5px]"
              onClick={() => setSelectedDealId(null)}
              aria-label={t.common.close}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-border/70 bg-background/95 p-4 shadow-2xl backdrop-blur-xl"
              role="dialog"
              aria-label={t.crm.details}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{t.crm.details}</p>
                  <h2 className="mt-1 text-2xl font-semibold">{selectedDeal.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedDeal.company}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDealId(null)} aria-label={t.common.close}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-2 rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm md:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-primary" /> {t.crm.value}: {formatCurrency(selectedDeal.value)}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" /> {t.crm.owner}: {selectedDeal.owner}
                </p>
                <p className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> {t.crm.source}: {selectedDeal.source}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" /> {t.crm.nextAction}: {selectedDeal.nextAction}
                </p>
              </div>

              <div className="mt-4 space-y-4">
                <Card className="rounded-2xl border-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t.crm.notes}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <textarea
                      value={newNote}
                      onChange={(event) => setNewNote(event.target.value)}
                      className="ui-textarea min-h-[110px]"
                      placeholder={t.crm.notePlaceholder}
                    />
                    <Button className="w-full gap-2" variant="secondary" onClick={addNoteToDeal}>
                      <Plus className="h-4 w-4" />
                      {t.crm.addNote}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t.crm.taskTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex gap-2">
                      <Input
                        value={newTask}
                        onChange={(event) => setNewTask(event.target.value)}
                        placeholder={t.crm.taskPlaceholder}
                      />
                      <Button onClick={addTaskToDeal}>{t.crm.addTask}</Button>
                    </div>
                    <div className="space-y-2">
                      {selectedDeal.tasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-left text-sm",
                            task.done ? "text-muted-foreground line-through" : ""
                          )}
                          onClick={() => toggleTask(task.id)}
                        >
                          <span>{task.title}</span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {task.done ? t.crm.markPending : t.crm.markDone}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t.crm.timeline}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedDeal.events.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                        {t.crm.noTimeline}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDeal.events.map((event) => (
                          <div key={event.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                            <p className="text-sm">{event.text}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{new Date(event.date).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
        <DialogContent onClose={() => setSaveViewOpen(false)}>
          <DialogHeader>
            <DialogTitle>{t.crm.saveViewTitle}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="crm-view-name" className="field-label">
                {t.crm.viewName}
              </label>
              <Input
                id="crm-view-name"
                value={viewName}
                onChange={(event) => setViewName(event.target.value)}
                placeholder={t.crm.viewNamePlaceholder}
              />
            </div>
            <Button className="w-full" onClick={saveCurrentView}>
              {t.crm.saveViewAction}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
