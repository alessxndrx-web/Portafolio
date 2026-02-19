"use client";

import { useAuth } from "@/lib/useAuth";
import { useTranslation } from "@/lib/useTranslation";
import { useEditableWorkspace } from "@/lib/useEditableWorkspace";
import { EditableSitePreview } from "@/components/demos/EditableSitePreview";

export function EditableSiteContent() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [workspace] = useEditableWorkspace();

  return (
    <EditableSitePreview
      content={workspace.published}
      showEditAction={isAuthenticated}
      editLabel={t.editableSite.editContent}
      carouselPrevLabel={t.editableSite.carouselPrev}
      carouselNextLabel={t.editableSite.carouselNext}
    />
  );
}
