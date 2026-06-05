import { motion } from "framer-motion";

interface Section {
  h: string;
  p: string;
}

interface Props {
  title: string;
  updated: string;
  sections: Section[];
}

export function LegalPage({ title, updated, sections }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      </motion.div>

      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <motion.section
            key={s.h}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
          >
            <h2 className="font-display text-xl font-semibold">{s.h}</h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">{s.p}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
