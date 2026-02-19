"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CRMContent } from "@/components/demos/CRMContent";

export default function CRMPage() {
  return (
    <ProtectedRoute>
      <CRMContent />
    </ProtectedRoute>
  );
}
