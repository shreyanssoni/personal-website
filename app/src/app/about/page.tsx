import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Mail, Github, Instagram, Twitter, ArrowRight, ExternalLink } from "lucide-react";
import GradientBlobs from "@/components/GradientBlobs";
import GlassCard from "@/components/GlassCard";
import SectionLabel from "@/components/SectionLabel";
import profile from "@/data/profile.json";

export const metadata: Metadata = {
  title: "About",
  description:
    "I am Shreyans Soni, a graduate in Electronics and Instrumentation from BITS Pilani, Hyderabad Campus.",
};

const socials = [
  { href: profile.socials.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: `mailto:${profile.socials.email}`, icon: Mail, label: "Email" },
  { href: profile.socials.github, icon: Github, label: "GitHub" },
  { href: profile.socials.instagram, icon: Instagram, label: "Instagram" },
  { href: profile.socials.twitter, icon: Twitter, label: "Twitter" },
];

const timeline = [
  {
    year: "2019-2023",
    title: "BITS Pilani, Hyderabad",
    description: "B.E. Electronics & Instrumentation",
  },
  {
    year: "2021+",
    title: "Web Development & AI",
    description: "Building full-stack applications with modern frameworks",
  },
  {
    year: "Present",
    title: "Creator & Developer",
    description: "Working at the intersection of technology and human experience",
  },
];

export default function About() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative bg-cream min-h-[80vh] flex items-center overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Profile Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="w-64 h-80 md:w-80 md:h-[400px] rounded-2xl overflow-hidden rotate-2 shadow-2xl">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-64 h-80 md:w-80 md:h-[400px] rounded-2xl border-2 border-accent-coral/30 -z-10 -rotate-2" />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7">
              <SectionLabel text="ABOUT_ME" className="!text-text-dark/40 mb-4 block" />
              <h1 className="font-display text-6xl sm:text-8xl leading-[0.85] text-text-dark mb-6">
                HELLO,<br />
                I&apos;M <span className="text-accent-coral">SHREYANS</span>
              </h1>
              <p className="font-body text-base text-text-dark/60 uppercase tracking-wider mb-6">
                {profile.title}
              </p>
              <div
                className="font-body text-base text-text-dark/70 leading-relaxed mb-8 max-w-lg [&>p]:mb-4"
                dangerouslySetInnerHTML={{ __html: profile.aboutHtml }}
              />
              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href={profile.link}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-accent-coral text-white font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-accent-coral/90 transition-colors"
                >
                  Download CV <ExternalLink size={14} />
                </a>
                <a
                  href={profile.projects}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2 border border-text-dark/20 text-text-dark font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg hover:border-accent-coral/40 transition-colors"
                >
                  GitHub <Github size={14} />
                </a>
              </div>
              <div className="flex items-center gap-4">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    rel="noreferrer"
                    target="_blank"
                    className="text-text-dark/40 hover:text-accent-coral transition-colors"
                    aria-label={s.label}
                  >
                    <s.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section className="relative py-24 overflow-hidden">
        <GradientBlobs
          color1="rgba(255, 79, 75, 0.08)"
          color2="rgba(164, 212, 65, 0.06)"
          color3="rgba(0, 229, 255, 0.04)"
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionLabel text="JOURNEY" className="mb-3 block" />
          <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-12">
            THE PATH SO FAR
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-coral/40 via-accent-coral/20 to-transparent" />

            {timeline.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-start mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent-coral border-2 border-midnight z-10" />

                {/* Card */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16" : "md:pl-16"}`}>
                  <GlassCard className="p-6">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-accent-coral uppercase">
                      {item.year}
                    </span>
                    <h3 className="font-display text-2xl text-text-primary mt-2">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="font-body text-sm text-text-secondary mt-2">
                      {item.description}
                    </p>
                  </GlassCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="relative py-24 overflow-hidden bg-surface">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SectionLabel text="PHILOSOPHY" className="mb-6 block" />
          <h2 className="font-serif text-3xl sm:text-4xl italic text-text-primary max-w-2xl mx-auto leading-relaxed mb-8">
            &ldquo;I believe in building software that feels alive &mdash; organic systems
            that grow and adapt, powered by precise engineering underneath.&rdquo;
          </h2>
          <p className="font-hand text-xl text-accent-coral/70">
            &mdash; the slow code manifesto
          </p>
        </div>
      </section>

      {/* ===== INTERESTS ===== */}
      <section className="relative py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <SectionLabel text="INTERESTS" className="mb-3 block" />
          <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-12">
            WHAT EXCITES ME
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI & Machine Learning", desc: "Exploring the frontier of intelligent systems and generative models" },
              { title: "Web Development", desc: "Crafting beautiful, performant web experiences with modern frameworks" },
              { title: "Electronics", desc: "Tinkering with components and building hardware-software bridges" },
              { title: "Writing", desc: "Articulating ideas through blogs and creative expression" },
              { title: "Music", desc: "Making sounds with guitar and exploring sonic landscapes" },
              { title: "Badminton", desc: "Hitting a shuttle with a racket — simple joy, complex strategy" },
            ].map((item) => (
              <GlassCard key={item.title} className="p-6 hover:border-accent-coral/20 transition-colors">
                <h3 className="font-display text-xl text-text-primary mb-2">
                  {item.title.toUpperCase()}
                </h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
