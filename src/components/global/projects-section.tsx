"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Layers } from "lucide-react";
import { cn } from "@/functions";
import { Container } from "@/components";

/**
 * Projects / Technical Inventory section
 * -----------------------------------------------------------------
 * Drop this file in: src/components/global/projects-section.tsx
 * (export it from src/components/index if that's how your project
 * re-exports things — check how Features/Perks are exported there).
 * Then render <ProjectsSection /> inside src/app/(marketing)/page.tsx.
 *
 * Edit the `projects` array below with your own bureau d'études
 * technique reference list. Each entry behaves like an inventory
 * line: a reference code, a status, a category and a short brief.
 * -----------------------------------------------------------------
 */

type ProjectStatus = "En cours" | "Livré" | "En étude";

interface Project {
  ref: string;
  title: string;
  category: string;
  status: ProjectStatus;
  client: string;
  summary: string;
  stack: string[];
}

const projects: Project[] = [
  {
    ref: "REF-001",
    title: "RentCar-OS",
    category: "SaaS B2B",
    status: "En cours",
    client: "Location de véhicules — Maroc / Afrique du Nord",
    summary:
      "Plateforme de gestion de flotte et de réservation pour loueurs de véhicules francophones.",
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    ref: "REF-002",
    title: "Inventaire Parc Éolien",
    category: "Énergie",
    status: "En cours",
    client: "ONEE — Parc éolien d'Amougdoul, Essaouira",
    summary:
      "Application mobile de gestion de stock et d'inventaire technique pour un parc éolien.",
    stack: ["React Native", "SQLite"],
  },
  {
    ref: "REF-003",
    title: "Nom du projet",
    category: "Catégorie",
    status: "En étude",
    client: "Client / secteur",
    summary: "Décrivez ici le projet en une phrase.",
    stack: ["Tech", "Tech", "Tech"],
  },
];

const statusStyles: Record<ProjectStatus, string> = {
  "En cours": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Livré: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "En étude": "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProjectsSection() {
  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(projects.map((p) => p.category)))],
    []
  );
  const [active, setActive] = useState("Tous");

  const filtered =
    active === "Tous" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="projects" className="relative py-8 lg:py-20">
    <Container className="relative">
      {/* section header */}
      <div className="mb-12 flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          Inventaire des projets
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nos réalisations, référencées comme un dossier technique
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Chaque projet est classé par référence, statut et domaine —
          exactement comme un registre de bureau d&apos;études.
        </p>
      </div>

      {/* filters */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              active === cat
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* grid */}
      <motion.div
        layout
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.article
              key={project.ref}
              layout
              variants={item}
              exit={{ opacity: 0, y: -12 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              {/* blueprint corner marks */}
              <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-foreground/20 transition-colors group-hover:border-foreground/50" />
              <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-foreground/20 transition-colors group-hover:border-foreground/50" />

              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs tracking-widest text-muted-foreground">
                  {project.ref}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    statusStyles[project.status]
                  )}
                >
                  {project.status}
                </span>
              </div>

              <h3 className="mb-1 text-lg font-semibold">{project.title}</h3>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                {project.category} · {project.client}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                {project.summary}
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <button className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                Voir le détail
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </Container>
    </section>
  );
}
