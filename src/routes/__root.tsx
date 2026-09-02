import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "color-scheme", content: "light dark" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Asnan Dental — Supply Ordering" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
