import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — SOUVENIR" }] }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20 lg:py-32">
      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Get in touch</p>
          <h1 className="mt-4 font-serif text-6xl lg:text-7xl leading-[0.95]">Write to <em className="italic">us</em>.</h1>
          <p className="mt-6 text-muted-foreground max-w-md">We read every letter. Most replies come within a working day, often sooner — sometimes with a postcard.</p>

          <div className="mt-12 space-y-6 text-sm">
            <div className="flex gap-4"><Mail className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} /><div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Email</p><p className="mt-1">hello@souvenir.shop</p></div></div>
            <div className="flex gap-4"><MapPin className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} /><div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Atelier</p><p className="mt-1">Rua de São Mamede 14<br />1100‑533 Lisboa, Portugal</p></div></div>
            <div className="flex gap-4"><Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} /><div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Hours</p><p className="mt-1">Tue – Sat, 11 – 19h<br />By appointment Mon &amp; Sun</p></div></div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); toast.success("Letter sent."); (e.target as HTMLFormElement).reset(); }} className="lg:col-span-7 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Your name" required />
            <Field label="Email" type="email" required />
          </div>
          <Field label="Subject" required />
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Message</span>
            <textarea required rows={8} className="mt-1.5 w-full bg-transparent border-b hairline py-2.5 text-sm outline-none focus:border-foreground resize-none" />
          </label>
          <button className="bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">Send letter →</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-transparent border-b hairline py-2.5 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
