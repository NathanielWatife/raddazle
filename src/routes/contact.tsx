import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { contactService } from "@/lib/services";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · Raddazle" },
      {
        name: "description",
        content: "Get in touch with Raddazle. We respond within 24 hours.",
      },
      { property: "og:title", content: "Contact Raddazle" },
      {
        property: "og:description",
        content: "Talk to a real human. We're here to help.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message || "Invalid input");
    setLoading(true);
    try {
      await contactService.submit(parsed.data);
      toast.success("Thanks! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not send message";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Let's talk.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Questions, feedback, partnership ideas — we'd love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          {[
            {
              icon: Mail,
              label: "Email",
              value: "hello@raddazle.com",
              href: "mailto:hello@raddazle.com",
            },
            {
              icon: Phone,
              label: "Phone",
              value: "+234 (0) 800 123 4567",
              href: "tel:+2348001234567",
            },
            { icon: MapPin, label: "Office", value: "Lagos, Nigeria" },
            {
              icon: MessageSquare,
              label: "Live chat",
              value: "Mon–Sat · 9am–6pm WAT",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </p>
                {c.href ? (
                  <a href={c.href} className="mt-0.5 block font-medium hover:text-primary">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-0.5 font-medium">{c.value}</p>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={onSubmit}
          className="lg:col-span-3 space-y-4 rounded-3xl border border-border bg-card p-8 shadow-elevated"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 rounded-full px-6 shadow-glow">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Send message
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
