"use client";

import { PLANS } from "@/constants";
import { cn } from "@/functions";
import { motion } from "framer-motion";
import { ArrowUpRightIcon, ImageIcon, LucideIcon, MapPinIcon, RulerIcon } from "lucide-react";
import { useState } from "react";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";

type Project = {
    id: string;
    title: string;
    category: string;
    location: string;
    surface: string;
    mission: string;
    year: string;
    description: string;
    image?: string;
    featured?: boolean;
};

const CATEGORIES = ["Tous", "Résidentiel", "Industriel", "Tertiaire", "Infrastructure"] as const;

const Pricing = () => {
    const [active, setActive] = useState<(typeof CATEGORIES)[number]>("Tous");

    const filtered: Project[] =
        active === "Tous" ? PLANS : PLANS.filter((p) => p.category === active);

    const featured = active === "Tous" ? filtered.find((p) => p.featured) : undefined;
    const rest = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative">
            <Container>
                <div className="flex flex-col items-center text-center max-w-xl mx-auto">
                    <SectionBadge title="Nos Réalisations" />
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
                        Des projets concrets, pensés avec précision
                    </h2>
                    <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
                        Résidentiel, industriel, tertiaire ou infrastructure : un aperçu des études techniques que BET-digital accompagne, du premier plan à la livraison.
                    </p>
                </div>
            </Container>

            <div className="mt-8 w-full relative flex flex-col items-center justify-center">
                <div className="absolute hidden lg:block top-1/2 right-2/3 translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-primary/15 blur-[10rem] -z-10"></div>
                <div className="absolute hidden lg:block top-1/2 left-2/3 -translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-violet-500/15 blur-[10rem] -z-10"></div>

                <Container>
                    <div className="flex flex-wrap items-center justify-center gap-1 p-1 rounded-full border border-border/60 bg-background/40 backdrop-blur-sm mx-auto w-fit">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActive(cat)}
                                className={cn(
                                    "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200",
                                    active === cat ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {active === cat && (
                                    <motion.span
                                        layoutId="active-project-category"
                                        className="absolute inset-0 rounded-full bg-primary/90 -z-10"
                                        transition={{ type: "spring", duration: 0.5 }}
                                    />
                                )}
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="mt-14 w-full flex flex-col gap-6">
                        {featured && <FeaturedProjectCard project={featured} />}

                        {rest.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                {rest.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        )}

                        {filtered.length === 0 && (
                            <p className="text-center text-muted-foreground py-12">
                                Aucun projet à afficher pour cette catégorie pour le moment.
                            </p>
                        )}
                    </div>
                </Container>
            </div>
        </div>
    )
};

// Reserved space for a real project photo. Swap the contents of this div for
// an <img src="..." /> (or next/image) once photos are available — keep the
// same wrapping className so sizing stays consistent everywhere it's used.
const ImagePlaceholder = ({ className }: { className?: string }) => (
    <div
        className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/60 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent",
            className
        )}
    >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <ImageIcon className="w-8 h-8" strokeWidth={1.3} />
            <span className="text-xs">Photo du projet</span>
        </div>
    </div>
);

const CategoryBadge = ({ category }: { category: string }) => (
    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-background/70 backdrop-blur-sm border border-border/60 text-foreground">
        {category}
    </span>
);

const StatChip = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-foreground/5 border border-border/40">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
    </span>
);

const FeaturedProjectCard = ({ project }: { project: Project }) => (
    <div className="w-full rounded-2xl border border-primary/50 p-3 [background-image:linear-gradient(345deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.03)_100%)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
                <ImagePlaceholder className="w-full h-64 lg:h-full" />
                <CategoryBadge category={project.category} />
            </div>
            <div className="flex flex-col justify-center p-3">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    Projet phare · {project.year}
                </span>
                <h3 className="text-xl md:text-2xl font-medium font-heading mt-2">
                    {project.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mt-3">
                    {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-5">
                    <StatChip icon={MapPinIcon} label={project.location} />
                    <StatChip icon={RulerIcon} label={project.surface} />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                    <span className="text-foreground font-medium">Mission : </span>
                    {project.mission}
                </p>
            </div>
        </div>
    </div>
);

const ProjectCard = ({ project }: { project: Project }) => (
    <div className="group w-full rounded-2xl border border-border/60 hover:border-primary/50 p-3 flex flex-col [background-image:linear-gradient(345deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.03)_100%)] transition-colors duration-300">
        <div className="relative">
            <ImagePlaceholder className="w-full h-44" />
            <CategoryBadge category={project.category} />
        </div>
        <div className="flex flex-col flex-1 p-3">
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-medium font-heading">
                    {project.title}
                </h3>
                <ArrowUpRightIcon className="w-4 h-4 shrink-0 mt-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
                {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
                <StatChip icon={MapPinIcon} label={project.location} />
                <StatChip icon={RulerIcon} label={project.surface} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
                <span className="text-foreground/80 font-medium">Mission : </span>
                {project.mission}
            </p>
        </div>
    </div>
);

export default Pricing