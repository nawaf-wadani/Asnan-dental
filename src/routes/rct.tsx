import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AppShell";
import RctOrder from "@/components/rct/RctOrder";

export const Route = createFileRoute("/rct")({
  component: () => (
    <RequireAuth>
      <RctOrder />
    </RequireAuth>
  ),
});
