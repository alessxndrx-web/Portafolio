"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Command,
  DollarSign,
  Download,
  FileText,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, StatCard } from "@/components/design";
import { StaggerContainer, StaggerItem } from "@/lib/motion";
import type { User } from "@/types";

type ActivityItem = {
  id: string;
  message: string;
  date: string;
};

type DashboardTab = "overview" | "users" | "settings";

type CommandAction = {
  id: string;
  label: string;
  run: () => void;
};

function DashboardSkeletonCard() {
  return <div className="h-[126px] animate-pulse rounded-2xl border border-border/70 bg-secondary/45" />;
}

export function DashboardContent() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useLocalStorage<User[]>("dashboard_users", []);
  const [profileForm, setProfileForm] = useLocalStorage("dashboard_profile", {
    name: "Demo User",
    email: "demo@site.com",
  });
  const [activeTab, setActiveTab] = useLocalStorage<DashboardTab>("ui_dashboard_active_tab", "overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>("ui_dashboard_sidebar_collapsed", false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersLoadedOnce, setUsersLoadedOnce] = useState(false);

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "user",
  });

  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const tabs: DashboardTab[] = ["overview", "users", "settings"];
    if (!tabs.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOverviewLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab !== "users" || usersLoadedOnce) {
      return;
    }

    setIsUsersLoading(true);
    const timer = window.setTimeout(() => {
      setIsUsersLoading(false);
      setUsersLoadedOnce(true);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [activeTab, usersLoadedOnce]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditableElement =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if (event.key === "/" && !isEditableElement) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      const isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommandShortcut) {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const addActivity = useCallback((message: string) => {
    const entry: ActivityItem = {
      id: Math.random().toString(36).slice(2, 9),
      message,
      date: new Date().toISOString(),
    };

    setActivity((previous) => [entry, ...previous].slice(0, 8));
  }, []);

  const runQuickAction = useCallback((message: string, activityMessage: string) => {
    showToast(message, "success");
    addActivity(activityMessage);
  }, [addActivity, showToast]);

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", role: "user" });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role });
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      showToast(t.dashboard.fillAllFields, "error");
      return;
    }

    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...userForm } : user)));
      showToast(t.dashboard.userUpdated, "success");
      addActivity(t.dashboard.userUpdated);
    } else {
      const newUser: User = {
        id: Math.random().toString(36).slice(2, 9),
        ...userForm,
        status: "active",
      };
      setUsers([newUser, ...users]);
      showToast(t.dashboard.userAdded, "success");
      addActivity(`${t.dashboard.activityNewUser}: ${newUser.name}`);
    }

    setUserDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
    showToast(t.dashboard.userDeleted, "success");
    addActivity(t.dashboard.userDeleted);
  };

  const handleSaveProfile = () => {
    showToast(t.dashboard.settings.saved, "success");
    addActivity(t.dashboard.activityProfileSaved);
  };

  const commandActions = useMemo<CommandAction[]>(() => {
    return [
      {
        id: "goto-overview",
        label: t.dashboard.commandActionOverview,
        run: () => setActiveTab("overview"),
      },
      {
        id: "goto-users",
        label: t.dashboard.commandActionUsers,
        run: () => setActiveTab("users"),
      },
      {
        id: "goto-settings",
        label: t.dashboard.commandActionSettings,
        run: () => setActiveTab("settings"),
      },
      {
        id: "create-user",
        label: t.dashboard.commandActionAddUser,
        run: handleAddUser,
      },
      {
        id: "export-data",
        label: t.dashboard.commandActionExport,
        run: () => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityExported),
      },
      {
        id: "create-report",
        label: t.dashboard.commandActionReport,
        run: () => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityProfileSaved),
      },
      {
        id: "invite-team",
        label: t.dashboard.commandActionInvite,
        run: () => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityNewUser),
      },
    ];
  }, [
    setActiveTab,
    t.dashboard.commandActionOverview,
    t.dashboard.commandActionUsers,
    t.dashboard.commandActionSettings,
    t.dashboard.commandActionAddUser,
    t.dashboard.commandActionExport,
    t.dashboard.commandActionReport,
    t.dashboard.commandActionInvite,
    t.dashboard.quickActionDone,
    t.dashboard.activityExported,
    t.dashboard.activityProfileSaved,
    t.dashboard.activityNewUser,
    runQuickAction,
  ]);

  const filteredCommandActions = useMemo(() => {
    if (!commandQuery.trim()) {
      return commandActions;
    }

    const query = commandQuery.toLowerCase();
    return commandActions.filter((action) => action.label.toLowerCase().includes(query));
  }, [commandActions, commandQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    const lowerTerm = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerTerm) ||
        user.email.toLowerCase().includes(lowerTerm) ||
        user.role.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, users]);

  const filteredActivity = useMemo(() => {
    if (!searchTerm.trim()) {
      return activity;
    }
    const lower = searchTerm.toLowerCase();
    return activity.filter((item) => item.message.toLowerCase().includes(lower));
  }, [activity, searchTerm]);

  const activeUsers = users.filter((user) => user.status === "active").length;

  const stats = [
    {
      label: t.dashboard.stats.totalUsers,
      value: users.length,
      icon: Users,
    },
    {
      label: t.dashboard.stats.activeUsers,
      value: activeUsers,
      icon: BarChart3,
    },
    {
      label: t.dashboard.stats.revenue,
      value: 45231,
      icon: DollarSign,
      prefix: "$",
    },
    {
      label: t.dashboard.stats.growth,
      value: 12.5,
      icon: TrendingUp,
      prefix: "+",
      suffix: "%",
      decimals: 1,
    },
  ];

  const sidebarItems: Array<{ id: DashboardTab; label: string; icon: typeof BarChart3 }> = [
    { id: "overview", label: t.dashboard.overview, icon: BarChart3 },
    { id: "users", label: t.dashboard.users, icon: Users },
    { id: "settings", label: t.dashboard.settings.title, icon: FileText },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="grid gap-4 md:grid-cols-[220px_1fr] xl:grid-cols-[250px_1fr]">
        <motion.aside
          animate={{ width: sidebarCollapsed ? 78 : "100%" }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="surface-card hidden h-[calc(100vh-9rem)] min-h-[620px] flex-col rounded-2xl border p-3 md:flex"
        >
          <div className="mb-4 flex items-center justify-between">
            {!sidebarCollapsed ? (
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t.dashboard.title}
              </p>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed((previous) => !previous)}
              aria-label={sidebarCollapsed ? t.dashboard.expandSidebar : t.dashboard.collapseSidebar}
              data-testid="dashboard-toggle-sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border/70 pt-4">
            {!sidebarCollapsed ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t.dashboard.quickActions}
              </p>
            ) : null}
            <div className="space-y-1.5">
              <Button
                variant="secondary"
                size={sidebarCollapsed ? "icon" : "sm"}
                className="w-full justify-start"
                onClick={() => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityExported)}
              >
                <Download className="h-4 w-4" />
                {!sidebarCollapsed ? <span className="ml-2">{t.dashboard.quickActionExport}</span> : null}
              </Button>
              <Button
                variant="secondary"
                size={sidebarCollapsed ? "icon" : "sm"}
                className="w-full justify-start"
                onClick={() => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityProfileSaved)}
              >
                <FileText className="h-4 w-4" />
                {!sidebarCollapsed ? <span className="ml-2">{t.dashboard.quickActionReport}</span> : null}
              </Button>
              <Button
                variant="secondary"
                size={sidebarCollapsed ? "icon" : "sm"}
                className="w-full justify-start"
                onClick={() => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityNewUser)}
              >
                <UserPlus className="h-4 w-4" />
                {!sidebarCollapsed ? <span className="ml-2">{t.dashboard.quickActionInvite}</span> : null}
              </Button>
            </div>
          </div>
        </motion.aside>

        <section className="space-y-4">
          <Card className="rounded-2xl border-border/70 bg-card/78 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold md:text-3xl">{t.dashboard.title}</h1>
                <p className="text-sm text-muted-foreground">{t.dashboard.keyboardHint}</p>
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4"
                  onClick={() => setCommandOpen(true)}
                  data-testid="dashboard-open-command"
                >
                  <Command className="h-3.5 w-3.5" />
                  {t.dashboard.openCommandHint}
                </button>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9"
                  placeholder={t.dashboard.searchPlaceholder}
                />
              </div>
            </div>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as DashboardTab)}
          >
            <TabsList>
              <TabsTrigger value="overview">{t.dashboard.overview}</TabsTrigger>
              <TabsTrigger value="users">{t.dashboard.users}</TabsTrigger>
              <TabsTrigger value="settings">{t.dashboard.settings.title}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {isOverviewLoading ? (
                <>
                  <p className="text-sm text-muted-foreground">{t.dashboard.loadingStats}</p>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <DashboardSkeletonCard key={index} />
                    ))}
                  </div>
                </>
              ) : (
                <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <StaggerItem key={stat.label}>
                      <StatCard
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}

              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <Card className="rounded-2xl border-border/70">
                  <CardHeader>
                    <CardTitle>{t.dashboard.quickActions}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button
                        variant="secondary"
                        onClick={() => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityExported)}
                      >
                        {t.dashboard.quickActionExport}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityProfileSaved)}
                      >
                        {t.dashboard.quickActionReport}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => runQuickAction(t.dashboard.quickActionDone, t.dashboard.activityNewUser)}
                      >
                        {t.dashboard.quickActionInvite}
                      </Button>
                    </div>
                    <div className="mt-4 rounded-xl border border-border/70 bg-secondary/35 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {t.dashboard.overview}
                      </p>
                      <div className="mt-3 grid grid-cols-7 items-end gap-1">
                        {[38, 58, 44, 70, 54, 62, 88].map((value, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${value}%` }}
                            transition={{ duration: 0.24, delay: index * 0.03 }}
                            className="rounded-md bg-gradient-to-t from-primary/35 to-accent/65"
                            style={{ minHeight: 24 }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70">
                  <CardHeader>
                    <CardTitle>{t.dashboard.activity}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {filteredActivity.length === 0 ? (
                          <motion.p
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground"
                          >
                            {t.common.noData}
                          </motion.p>
                        ) : (
                          filteredActivity.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="rounded-lg border border-border/70 bg-secondary/30 p-3"
                            >
                              <p className="text-sm font-medium">{item.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{t.dashboard.users}</h2>
                <Button className="gap-2" onClick={handleAddUser} data-testid="dashboard-add-user">
                  <UserPlus className="h-4 w-4" />
                  {t.dashboard.usersTable.add}
                </Button>
              </div>

              {isUsersLoading ? (
                <Card className="rounded-2xl border-border/70 p-6">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{t.dashboard.loadingUsers}</p>
                    <div className="h-10 animate-pulse rounded bg-secondary/50" />
                    <div className="h-10 animate-pulse rounded bg-secondary/50" />
                    <div className="h-10 animate-pulse rounded bg-secondary/50" />
                  </div>
                </Card>
              ) : filteredUsers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={t.dashboard.noUsersTitle}
                  description={t.dashboard.noUsersDesc}
                  actionLabel={t.dashboard.usersTable.add}
                  onAction={handleAddUser}
                />
              ) : (
                <Card className="rounded-2xl border-border/70">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.dashboard.usersTable.name}</TableHead>
                          <TableHead>{t.dashboard.usersTable.email}</TableHead>
                          <TableHead>{t.dashboard.usersTable.role}</TableHead>
                          <TableHead>{t.dashboard.usersTable.status}</TableHead>
                          <TableHead>{t.dashboard.usersTable.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence initial={false}>
                          {filteredUsers.map((user) => (
                            <motion.tr
                              key={user.id}
                              layout
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="border-b border-border/60"
                            >
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="capitalize">{user.role}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                  {user.status === "active" ? t.dashboard.usersTable.active : t.dashboard.usersTable.inactive}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => handleEditUser(user)}>
                                    {t.dashboard.usersTable.edit}
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                                    {t.dashboard.usersTable.delete}
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="rounded-2xl border-border/70">
                <CardHeader>
                  <CardTitle>{t.dashboard.settings.profile}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="dashboard-profile-name" className="mb-2 block text-sm font-medium">
                      {t.dashboard.settings.name}
                    </label>
                    <Input
                      id="dashboard-profile-name"
                      value={profileForm.name}
                      onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="dashboard-profile-email" className="mb-2 block text-sm font-medium">
                      {t.dashboard.settings.email}
                    </label>
                    <Input
                      id="dashboard-profile-email"
                      value={profileForm.email}
                      onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                    />
                  </div>
                  <Button onClick={handleSaveProfile}>{t.dashboard.settings.save}</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent onClose={() => setUserDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingUser ? t.dashboard.usersTable.edit : t.dashboard.usersTable.add}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="dashboard-user-name" className="mb-1.5 block text-sm font-medium">
                {t.dashboard.usersTable.name}
              </label>
              <Input
                id="dashboard-user-name"
                data-testid="dashboard-user-name"
                value={userForm.name}
                onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              />
            </div>
            <div>
              <label htmlFor="dashboard-user-email" className="mb-1.5 block text-sm font-medium">
                {t.dashboard.usersTable.email}
              </label>
              <Input
                id="dashboard-user-email"
                data-testid="dashboard-user-email"
                value={userForm.email}
                onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              />
            </div>
            <div>
              <label htmlFor="dashboard-user-role" className="mb-1.5 block text-sm font-medium">
                {t.dashboard.usersTable.role}
              </label>
              <Input
                id="dashboard-user-role"
                data-testid="dashboard-user-role"
                value={userForm.role}
                onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
              />
            </div>
            <Button className="mt-2 w-full" onClick={handleSaveUser} data-testid="dashboard-user-save">
              {t.dashboard.settings.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogContent onClose={() => setCommandOpen(false)}>
          <DialogHeader>
            <DialogTitle>{t.dashboard.commandPaletteTitle}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <Input
              value={commandQuery}
              onChange={(event) => setCommandQuery(event.target.value)}
              placeholder={t.dashboard.commandPalettePlaceholder}
              autoFocus
            />
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {filteredCommandActions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                  {t.dashboard.commandPaletteEmpty}
                </p>
              ) : (
                filteredCommandActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="flex w-full items-center rounded-xl border border-border/70 bg-secondary/30 px-3 py-2 text-left text-sm font-medium transition hover:bg-secondary"
                    onClick={() => {
                      action.run();
                      setCommandOpen(false);
                      setCommandQuery("");
                    }}
                  >
                    {action.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
