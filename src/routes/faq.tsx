import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ · Raddazle" },
      {
        name: "description",
        content:
          "Answers to the most common questions about ordering, shipping, returns, and authenticity at Raddazle.",
      },
      { property: "og:title", content: "Raddazle FAQ" },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    section: "Orders",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse the shop, add items to your cart, and head to checkout. You can pay with card via Paystack, bank transfer, or cash on delivery.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "Yes — orders can be cancelled while they're still in 'Pending' or 'Processing' status. Go to My Orders and tap Cancel on the relevant order.",
      },
      {
        q: "How do I track my order?",
        a: "Sign in and visit My Orders. You'll see real-time status updates from confirmation through delivery.",
      },
    ],
  },
  {
    section: "Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Lagos: 1–2 business days. Other states: 2–5 business days. International orders take 7–14 business days depending on location.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes — contact us first for a custom shipping quote before placing the order.",
      },
      {
        q: "Is shipping free?",
        a: "Free shipping is available on orders above ₦50,000 within Nigeria.",
      },
    ],
  },
  {
    section: "Returns & Authenticity",
    items: [
      {
        q: "Are your products authentic?",
        a: "100%. Every product is sourced through authorized channels and we offer a full refund if proven otherwise.",
      },
      {
        q: "What is your return policy?",
        a: "Unopened items can be returned within 7 days of delivery for a full refund. See our Return Policy for full details.",
      },
      {
        q: "How do refunds work?",
        a: "Refunds are processed within 5–10 business days after we receive and inspect the returned item.",
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        q: "Do I need an account to shop?",
        a: "Yes — an account lets you track orders, save addresses, and check out faster.",
      },
      {
        q: "I forgot my password — what now?",
        a: "On the sign-in page, tap 'Forgot password?' and follow the email instructions.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Help center</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Can't find what you're looking for?{" "}
          <a href="/contact" className="font-medium text-primary hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {faqs.map((s) => (
          <section key={s.section}>
            <h2 className="font-display text-xl font-semibold">{s.section}</h2>
            <Accordion
              type="single"
              collapsible
              className="mt-3 rounded-2xl border border-border bg-card"
            >
              {s.items.map((it, i) => (
                <AccordionItem
                  key={i}
                  value={`${s.section}-${i}`}
                  className="border-border px-5 last:border-0"
                >
                  <AccordionTrigger className="text-left text-sm font-medium">
                    {it.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {it.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </div>
  );
}
