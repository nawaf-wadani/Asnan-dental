import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AppShell";
import AdminApp from "@/components/admin/AdminApp";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAuth adminOnly>
      <AdminApp />
    </RequireAuth>
  ),
});
