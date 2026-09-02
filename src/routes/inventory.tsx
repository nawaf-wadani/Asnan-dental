import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AppShell";
import InventoryManager from "@/components/inventory/InventoryManager";

export const Route = createFileRoute("/inventory")({
  component: () => (
    <RequireAuth>
      <InventoryManager />
    </RequireAuth>
  ),
});
