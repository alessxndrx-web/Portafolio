"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultEditableContent } from "@/lib/editable-default-content";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type { EditableContent, EditableContentWorkspace } from "@/types";

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

function defaultWorkspace(): EditableContentWorkspace {
  return {
    draft: defaultEditableContent,
    published: defaultEditableContent,
    lastSavedAt: null,
    lastPublishedAt: null,
  };
}

function normalizeWorkspace(value: unknown): EditableContentWorkspace {
  if (isWorkspace(value)) {
    return {
      draft: value.draft,
      published: value.published,
      lastSavedAt: value.lastSavedAt ?? null,
      lastPublishedAt: value.lastPublishedAt ?? null,
    };
  }

  if (isEditableContent(value)) {
    return {
      draft: value,
      published: value,
      lastSavedAt: null,
      lastPublishedAt: null,
    };
  }

  return defaultWorkspace();
}

export function useEditableWorkspace() {
  const [rawWorkspace, setRawWorkspace] = useLocalStorage<unknown>("editable_site_workspace", defaultWorkspace());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const workspace = useMemo(() => normalizeWorkspace(rawWorkspace), [rawWorkspace]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isWorkspace(rawWorkspace)) {
      return;
    }

    setRawWorkspace(workspace);
  }, [isHydrated, rawWorkspace, setRawWorkspace, workspace]);

  const setWorkspace = (
    value:
      | EditableContentWorkspace
      | ((current: EditableContentWorkspace) => EditableContentWorkspace)
  ) => {
    setRawWorkspace((previous: unknown) => {
      const normalized = normalizeWorkspace(previous);
      return value instanceof Function ? value(normalized) : value;
    });
  };

  return [workspace, setWorkspace] as const;
}
