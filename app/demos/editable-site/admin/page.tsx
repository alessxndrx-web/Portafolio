"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EditableSiteAdmin } from "@/components/demos/EditableSiteAdmin";

export default function EditableSiteAdminPage() {
  return (
    <ProtectedRoute>
      <EditableSiteAdmin />
    </ProtectedRoute>
  );
}
