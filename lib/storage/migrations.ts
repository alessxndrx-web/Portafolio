"use client";

import { defaultEditableContent } from "@/lib/editable-default-content";
import type { EditableContent, EditableContentWorkspace, Product } from "@/types";

const STORAGE_VERSION_KEY = "app_data_version";
export const APP_DATA_VERSION = 3;

function inferCategory(name: string): Product["category"] {
  const value = name.toLowerCase();
  if (value.includes("coffee") || value.includes("juice") || value.includes("latte") || value.includes("drink")) {
    return "drinks";
  }
  if (value.includes("book") || value.includes("note") || value.includes("pen") || value.includes("paper")) {
    return "office";
  }
  if (value.includes("phone") || value.includes("mouse") || value.includes("keyboard") || value.includes("tech")) {
    return "tech";
  }
  return "food";
}

function isEditableContent(value: unknown): value is EditableContent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as EditableContent;
  return (
    typeof entry.hero?.title === "string" &&
    typeof entry.hero?.subtitle === "string" &&
    typeof entry.features?.title === "string" &&
    Array.isArray(entry.features?.items) &&
    typeof entry.testimonials?.title === "string" &&
    Array.isArray(entry.testimonials?.items)
  );
}

function isWorkspace(value: unknown): value is EditableContentWorkspace {
  if (!value || typeof value !== "object") {
    return false;
  }

  const workspace = value as EditableContentWorkspace;
  return isEditableContent(workspace.draft) && isEditableContent(workspace.published);
}

function createWorkspace(content: EditableContent): EditableContentWorkspace {
  return {
    draft: content,
    published: content,
    lastSavedAt: null,
    lastPublishedAt: null,
  };
}

function migratePosProducts() {
  const raw = localStorage.getItem("pos_products");
  if (!raw) {
    return;
  }

  try {
    const products = JSON.parse(raw) as Product[];
    if (!Array.isArray(products)) {
      return;
    }

    const migrated = products.map((product) => ({
      ...product,
      category: product.category ?? inferCategory(product.name ?? ""),
    }));

    localStorage.setItem("pos_products", JSON.stringify(migrated));
  } catch (error) {
    console.error(error);
  }
}

function migrateEditableWorkspace() {
  const rawWorkspace = localStorage.getItem("editable_site_workspace");
  if (rawWorkspace) {
    try {
      const parsedWorkspace = JSON.parse(rawWorkspace) as unknown;
      if (isWorkspace(parsedWorkspace)) {
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const rawLegacy = localStorage.getItem("editable_site_content");

  let baseContent = defaultEditableContent;

  if (rawLegacy) {
    try {
      const parsedLegacy = JSON.parse(rawLegacy) as unknown;
      if (isEditableContent(parsedLegacy)) {
        baseContent = parsedLegacy;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const workspace = createWorkspace(baseContent);
  localStorage.setItem("editable_site_workspace", JSON.stringify(workspace));
  localStorage.setItem("editable_site_content", JSON.stringify(workspace.published));
}

function migrateLegacyUiPrefs() {
  const value = localStorage.getItem("ui_dashboard_sidebar_collapsed");
  if (value === null) {
    localStorage.setItem("ui_dashboard_sidebar_collapsed", JSON.stringify(false));
  }
}

const migrations: Array<() => void> = [
  migratePosProducts,
  migrateEditableWorkspace,
  migrateLegacyUiPrefs,
];

export function runStorageMigrations() {
  if (typeof window === "undefined") {
    return;
  }

  const rawVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  const currentVersion = rawVersion ? Number(rawVersion) : 0;

  for (let version = currentVersion; version < APP_DATA_VERSION; version += 1) {
    const migration = migrations[version];
    if (!migration) {
      continue;
    }

    migration();
  }

  localStorage.setItem(STORAGE_VERSION_KEY, String(APP_DATA_VERSION));
}
