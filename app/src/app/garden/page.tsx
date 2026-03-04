import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGardenPieces } from "@/lib/garden";
import GradientBlobs from "@/components/GradientBlobs";
import GlassCard from "@/components/GlassCard";
import SectionLabel from "@/components/SectionLabel";

export const metadata: Metadata = {
  title: "Garden",
  description:
    "A walk through thought. Fragments, stories, and artifacts from the mind's garden.",
};

export const revalidate = 3600;

export default async function GardenPage() {
  const pieces = await getGardenPieces();

  const hero = pieces.find((p) => p.type === "hero");
  const fragments = pieces.filter((p) => p.type === "fragment");
  const featured = pieces.find((p) => p.type === "featured");
  const artifacts = pieces.filter((p) => p.type === "artifact");

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden paper-texture">
        <GradientBlobs
          color1="rgba(255, 45, 133, 0.15)"
          color2="rgba(0, 245, 212, 0.10)"
          color3="rgba(0, 229, 255, 0.05)"
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.05] saturate-150"
          style={{ backgroundImage: "url(/assets/img/image.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/40 via-transparent to-midnight" />

        <div className="relative mx-auto max-w-7xl px-6 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <SectionLabel text="THE_GARDEN" className="mb-6 block" />
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl italic text-text-primary leading-[0.95] mb-6">
                {hero?.title ? (
                  <>
                    {hero.title.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-accent-pink drop-shadow-[0_0_15px_rgba(255,45,133,0.4)]">
                      {hero.title.split(" ").slice(-1)}
                    </span>
                  </>
                ) : (
                  <>
                    A Walk Through{" "}
                    <span className="text-accent-pink drop-shadow-[0_0_15px_rgba(255,45,133,0.4)]">
                      Thought
                    </span>
                  </>
                )}
              </h1>
              {(hero?.subtitle || !hero) && (
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-accent-teal/70 mb-6">
                  {hero?.subtitle || "The Mind's Garden"}
                </p>
              )}
              {(hero?.quote || !hero) && (
                <p className="font-hand text-xl text-accent-teal/70 max-w-md transform -rotate-1">
                  &ldquo;{hero?.quote || "Where the wild things grow in the silence between breaths."}&rdquo;
                </p>
              )}
            </div>

            {hero?.image_url && (
              <div className="lg:col-span-5">
                <div className="relative aspect-square">
                  <div className="absolute inset-0 bg-accent-pink/20 organic-shape animate-blob-float" />
                  <img
                    src={hero.image_url}
                    alt={hero.title}
                    className="w-full h-full object-cover organic-shape shadow-2xl grayscale brightness-75 contrast-125 hover:grayscale-0 transition-all duration-700 hover:brightness-100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== FRAGMENTS: PETALS OF THOUGHT ===== */}
      {fragments.length > 0 && (
        <section className="relative py-24 overflow-hidden">
          <GradientBlobs
            color1="rgba(255, 45, 133, 0.06)"
            color2="rgba(0, 245, 212, 0.04)"
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between mb-12 border-b border-accent-teal/20 pb-4">
              <h2 className="font-serif text-3xl font-bold text-text-primary">
                Petals of Thought
              </h2>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-teal/60">
                Short-form Fragments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {fragments.map((fragment, i) => (
                <div
                  key={fragment.id}
                  className={`glass-card neon-border-pink rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group ${
                    i === 1 ? "md:translate-y-6" : ""
                  }`}
                >
                  <p className="font-serif text-lg italic text-text-primary leading-relaxed mb-6">
                    &ldquo;{fragment.quote}&rdquo;
                  </p>
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-pink font-bold">
                      {fragment.label}
                    </span>
                    {fragment.title && (
                      <p className="font-body text-sm text-text-secondary mt-1">
                        {fragment.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED STORY ===== */}
      {featured && (
        <section className="relative py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <SectionLabel text="FEATURED_STORY" className="mb-8 block" />
            <a
              href={featured.link_url || "#"}
              className="group block"
              {...(featured.link_url?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {featured.image_url && (
                    <div className="relative h-64 md:h-auto min-h-[300px] overflow-hidden">
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        className="w-full h-full object-cover opacity-60 hover:opacity-100 hover:scale-105 brightness-90 hover:brightness-100 transition-all duration-1000"
                      />
                    </div>
                  )}
                  <div className={`p-8 md:p-12 lg:p-16 flex flex-col justify-center ${!featured.image_url ? "md:col-span-2" : ""}`}>
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent-teal mb-4">
                      {featured.label || "The Overgrowth"}
                    </span>
                    <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-primary group-hover:text-accent-pink transition-colors leading-tight mb-4">
                      {featured.title}
                    </h3>
                    {featured.subtitle && (
                      <p className="font-body text-sm text-text-secondary mb-4">
                        {featured.subtitle}
                      </p>
                    )}
                    <p className="font-body text-base text-text-secondary/80 italic leading-relaxed mb-8">
                      {featured.description}
                    </p>
                    {featured.link_url && (
                      <span className="inline-flex items-center gap-3 font-mono text-xs tracking-wider uppercase text-accent-pink font-bold group-hover:text-accent-teal transition-colors">
                        READ THE STORY <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* ===== ARTIFACTS GALLERY ===== */}
      {artifacts.length > 0 && (
        <section className="relative py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <SectionLabel text="ARTIFACTS" className="mb-8 block" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artifacts.map((artifact, i) => (
                <GlassCard
                  key={artifact.id}
                  className={`overflow-hidden group hover:border-accent-teal/20 transition-all duration-500 ${
                    i === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  {artifact.image_url && (
                    <div className={`relative overflow-hidden ${i === 0 ? "h-80 md:h-full" : "h-56"}`}>
                      <img
                        src={artifact.image_url}
                        alt={artifact.title}
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 font-display text-6xl text-white/10">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-teal mb-1 block">
                          {artifact.label}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-text-primary">
                          {artifact.title}
                        </h3>
                        {artifact.description && (
                          <p className="font-body text-sm text-text-secondary mt-1">
                            {artifact.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {!artifact.image_url && (
                    <div className="p-8">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-teal mb-2 block">
                        {artifact.label}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
                        {artifact.title}
                      </h3>
                      {artifact.description && (
                        <p className="font-body text-sm text-text-secondary">
                          {artifact.description}
                        </p>
                      )}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FALLBACK (no content) ===== */}
      {pieces.length === 0 && (
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden paper-texture">
          <GradientBlobs
            color1="rgba(255, 45, 133, 0.12)"
            color2="rgba(0, 245, 212, 0.08)"
          />
          <div className="relative text-center px-6">
            <h1 className="font-serif text-5xl sm:text-7xl italic text-text-primary leading-[0.95] mb-6">
              The Garden is{" "}
              <span className="text-accent-pink">Growing</span>
            </h1>
            <p className="font-hand text-lg text-accent-teal/60">
              Seeds have been planted. Check back soon.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
