"use client";

import Link from "next/link";
import { useRef } from "react";
import { Menu } from "lucide-react";
import styles from "@/styles/Navbar.module.css";

export default function Navbar({ color = "white" }: { color?: string }) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  function handleToggle() {
    const checkbox = checkboxRef.current;
    if (!checkbox || !ulRef.current) return;
    const clientWidth = window.innerWidth;
    if (clientWidth <= 800) {
      if (checkbox.checked) {
        ulRef.current.style.cssText = "left:0; display:block; height:auto;";
      } else {
        ulRef.current.style.cssText = "left:''; display:none;";
      }
    }
  }

  function handleLinkClick() {
    handleToggle();
    const checkbox = checkboxRef.current;
    if (checkbox) {
      checkbox.checked = false;
    }
    if (ulRef.current) {
      ulRef.current.style.cssText = "";
    }
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <nav>
      <div className={styles.navbar}>
        <input
          type="checkbox"
          name="check"
          className={styles.messageCheckbox}
          id="check"
          ref={checkboxRef}
          onChange={handleToggle}
        />
        <div className={styles.navcontainer}>
          <label htmlFor="check" className={styles.checkbtn}>
            <Menu size={24} color={color} />
          </label>
          <ul ref={ulRef} className={styles.navcontainerul}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={handleLinkClick}>
                <li>{link.label}</li>
              </Link>
            ))}
            <div className={styles.navcontent}>
              <img
                src="/assets/img/shreyans1.png"
                alt="Logo"
                loading="lazy"
                width="24"
                className="pb-1"
              />
              TheMicroBits
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
}
