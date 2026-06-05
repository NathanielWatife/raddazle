import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Hammer className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground text-pretty">
        {description ??
          "We're polishing this section in the next phase of the redesign. Functionality from your existing app will be preserved."}
      </p>
      <Link to="/" className="mt-8">
        <Button variant="outline" className="rounded-full">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Button>
      </Link>
    </section>
  );
}
