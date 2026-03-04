"use client";

import { useState, useEffect } from "react";
import { Facebook, Linkedin, Mail, Github, Instagram, Twitter } from "lucide-react";
import styles from "@/styles/Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setMessage("Please type a valid email");
      setIsError(true);
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEmail("");
        setIsError(false);
        setMessage("Merci beaucoup!");
      } else {
        setIsError(true);
        setMessage("Something went wrong. Try again!");
      }
    } catch {
      setIsError(true);
      setMessage("Network error. Try again!");
    }
  }

  const socials = [
    { href: "https://www.facebook.com/sonishreyans/", icon: Facebook },
    { href: "https://www.linkedin.com/in/shreyans-soni/", icon: Linkedin },
    { href: "mailto:soni21.shreyans@gmail.com", icon: Mail },
    { href: "https://github.com/shreyanssoni", icon: Github },
    { href: "https://www.instagram.com/shreyans.not.h/", icon: Instagram },
    { href: "https://x.com/abitofsoni", icon: Twitter },
  ];

  return (
    <footer>
      <div className={styles.form}>
        <h2 className={styles.request}>
          Don&apos;t miss on the fun. Receive the latest updates.
        </h2>
        <form onSubmit={handleSubscribe}>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      {message && (
        <p
          className={`px-2 pt-0.5 text-[16px] text-center ${
            isError ? "text-red-800" : "text-green-800"
          }`}
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {message}
        </p>
      )}
      <div className={styles.footerblog}>
        <ul className="flex flex-row p-2 list-none">
          {socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} rel="noreferrer" target="_blank">
                <s.icon size={20} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.footercontent}>
        THE MICROBITS | SHREYANS SONI
      </div>
      <p
        className="text-center my-2 mr-3 text-[11px]"
        style={{ fontFamily: "var(--font-josefin)" }}
      >
        Coded using{" "}
        <a rel="noreferrer" target="_blank" href="https://nextjs.org/">
          Next.js
        </a>{" "}
        and{" "}
        <a rel="noreferrer" target="_blank" href="https://ghost.org/">
          Ghost
        </a>
      </p>
    </footer>
  );
}
