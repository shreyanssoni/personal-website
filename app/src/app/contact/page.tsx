"use client";

import { useState } from "react";
import { Mail, Send, MapPin } from "lucide-react";
import GradientBlobs from "@/components/GradientBlobs";
import GlassCard from "@/components/GlassCard";
import SectionLabel from "@/components/SectionLabel";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !message) {
      setAlert("Please fill all fields.");
      setAlertType("error");
      setTimeout(() => setAlert(""), 3000);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setMessage("");
        setAlert("Message sent! I'll get back to you soon.");
        setAlertType("success");
      } else {
        setAlert("Something went wrong. Please try again!");
        setAlertType("error");
      }
    } catch {
      setAlert("Network error. Please try again!");
      setAlertType("error");
    }

    setTimeout(() => setAlert(""), 4000);
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <GradientBlobs
          color1="rgba(255, 210, 63, 0.1)"
          color2="rgba(0, 229, 255, 0.06)"
          color3="rgba(236, 91, 19, 0.04)"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: CTA */}
            <div className="flex flex-col justify-center">
              <SectionLabel text="CONTACT" className="mb-6 block" />
              <h1 className="font-display text-6xl sm:text-8xl leading-[0.85] text-text-primary mb-6">
                LET&apos;S
                <br />
                <span className="text-accent-sunny">CONNECT</span>
              </h1>
              <p className="font-body text-base text-text-secondary leading-relaxed mb-8 max-w-md">
                Whether it&apos;s a project idea, a collaboration, or just
                saying hi &mdash; I&apos;d love to hear from you.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="mailto:soni21.shreyans@gmail.com"
                  className="inline-flex items-center gap-3 text-text-secondary hover:text-accent-sunny transition-colors"
                >
                  <Mail size={18} />
                  <span className="font-mono text-sm">
                    sonishreyans01@gmail.com
                  </span>
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <GlassCard className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent border-b border-white/10 pb-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-sunny/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-transparent border-b border-white/10 pb-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-sunny/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={5}
                      className="w-full bg-transparent border-b border-white/10 pb-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-sunny/50 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent-sunny text-midnight font-mono text-xs tracking-wider uppercase px-6 py-4 rounded-lg hover:bg-accent-sunny/90 transition-colors"
                  >
                    Send Message <Send size={14} />
                  </button>
                </form>

                {alert && (
                  <p
                    className={`mt-4 font-mono text-xs text-center ${
                      alertType === "success"
                        ? "text-accent-teal"
                        : "text-accent-coral"
                    }`}
                  >
                    {alert}
                  </p>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
