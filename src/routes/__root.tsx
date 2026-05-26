import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Error 404</p>
        <h1 className="mt-6 font-serif text-7xl">Lost in transit.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for has wandered off the map.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Something broke</p>
        <h1 className="mt-6 font-serif text-5xl">A small misprint.</h1>
        <p className="mt-4 text-sm text-muted-foreground">Try again, or head back home.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
          >Try again</button>
          <a href="/" className="border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-secondary transition-colors">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SOUVENIR — Objects worth keeping." },
      { name: "description", content: "A curated atelier of travel keepsakes, editioned objects, and small luxuries from around the world." },
      { name: "author", content: "SOUVENIR" },
      { property: "og:title", content: "SOUVENIR — Objects worth keeping." },
      { property: "og:description", content: "A curated atelier of travel keepsakes and small luxuries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <StoreProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1"><Outlet /></main>
            <Footer />
          </div>
          <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 0, fontFamily: "var(--font-sans)" } }} />
        </StoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
