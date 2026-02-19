export type ProjectFilter = "all" | "dashboard" | "pos" | "cms" | "crm";

export const shellContainer = "mx-auto w-full max-w-6xl px-4 md:px-6";
export const sectionSpacing = "py-16 md:py-24";

export const projectPreviewStyles: Record<string, string> = {
  dashboard:
    "from-indigo-500/40 via-violet-500/25 to-cyan-500/35 dark:from-indigo-400/30 dark:via-violet-300/20 dark:to-cyan-300/30",
  pos: "from-cyan-500/40 via-sky-500/20 to-indigo-500/30 dark:from-cyan-400/30 dark:via-sky-300/20 dark:to-indigo-400/25",
  editable:
    "from-violet-500/40 via-fuchsia-500/20 to-cyan-500/30 dark:from-violet-400/30 dark:via-fuchsia-300/20 dark:to-cyan-300/25",
  crm: "from-emerald-500/38 via-cyan-500/22 to-blue-500/34 dark:from-emerald-400/30 dark:via-cyan-300/20 dark:to-blue-300/28",
};

export const filterChipBase =
  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
