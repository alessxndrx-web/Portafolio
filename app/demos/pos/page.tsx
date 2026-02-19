"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { POSContent } from "@/components/demos/POSContent";

export default function POSPage() {
  return (
    <ProtectedRoute>
      <POSContent />
    </ProtectedRoute>
  );
}
