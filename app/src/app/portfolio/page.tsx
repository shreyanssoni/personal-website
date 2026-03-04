import type { Metadata } from "next";
import { Github, ExternalLink } from "lucide-react";
import GradientBlobs from "@/components/GradientBlobs";
import GlassCard from "@/components/GlassCard";
import SectionLabel from "@/components/SectionLabel";
import projects from "@/data/projects.json";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function Portfolio() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <GradientBlobs
          color1="rgba(236, 91, 19, 0.12)"
          color2="rgba(0, 229, 255, 0.06)"
          color3="rgba(255, 210, 63, 0.05)"
        />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 w-full">
          <SectionLabel text="INNOVATION_HUB" className="mb-4 block" />
          <h1 className="font-display text-6xl sm:text-8xl text-text-primary leading-[0.85]">
            PROJECTS &<br />
            <span className="text-accent-orange">EXPERIMENTS</span>
          </h1>
          <p className="font-mono text-sm text-text-secondary mt-6 max-w-md">
            A collection of things I&apos;ve built, broken, and rebuilt.
          </p>
        </div>
      </section>

      {/* ===== PROJECTS GRID ===== */}
      <section className="relative py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {projects.map((project, i) => {
              const isLarge = i === 0 || i === 3;
              return (
                <div
                  key={project.id}
                  className={isLarge ? "md:col-span-8" : "md:col-span-4"}
                >
                  <GlassCard className="group relative h-64 md:h-80 overflow-hidden hover:border-accent-orange/20 transition-all duration-500">
                    {/* Background image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-6">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {project.codelink && (
                          <a
                            href={project.codelink}
                            rel="noreferrer"
                            target="_blank"
                            className="flex items-center gap-1.5 bg-surface/80 backdrop-blur-sm text-text-primary font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-lg hover:bg-accent-orange hover:text-midnight transition-colors"
                          >
                            <Github size={12} /> Code
                          </a>
                        )}
                        {project.websitelink && (
                          <a
                            href={project.websitelink}
                            rel="noreferrer"
                            target="_blank"
                            className="flex items-center gap-1.5 bg-surface/80 backdrop-blur-sm text-text-primary font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-lg hover:bg-accent-orange hover:text-midnight transition-colors"
                          >
                            <ExternalLink size={12} /> Live
                          </a>
                        )}
                      </div>

                      <div>
                        <span className="font-mono text-[10px] tracking-[0.2em] text-accent-orange uppercase">
                          Project {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl text-text-primary mt-1">
                          {project.title.toUpperCase()}
                        </h3>
                        {project.description && (
                          <p className="font-body text-sm text-text-secondary mt-2 max-w-md">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GITHUB CTA ===== */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display text-3xl text-text-primary mb-4">
            MORE ON GITHUB
          </h2>
          <p className="font-body text-sm text-text-secondary mb-8">
            Open source contributions and experimental repos
          </p>
          <a
            href="https://github.com/shreyanssoni"
            rel="noreferrer"
            target="_blank"
            className="inline-flex items-center gap-2 bg-accent-orange text-midnight font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-accent-orange/90 transition-colors"
          >
            <Github size={16} /> Visit GitHub
          </a>
        </div>
      </section>
    </>
  );
}
