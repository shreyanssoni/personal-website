"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/Contact.module.css";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !message) {
      setAlert("Please fill all the entries!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
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
        setAlert("Thank you for the response!");
      } else {
        setAlert("Something went wrong. Please try again!");
      }
    } catch {
      setAlert("Network error. Please try again!");
    }

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  }

  return (
    <>
      <Navbar color="black" />
      {showAlert && <div className={styles.alert}>{alert}</div>}
      <div style={{ background: "#fcf1e9" }} className={styles.main}>
        <div className={styles.containercontact}>
          <div className={styles.info}>
            <h2 className="text-[24px] text-black">Let&apos;s Connect!</h2>
            <a
              href="mailto:soni21.shreyans@gmail.com"
              rel="noreferrer"
              target="_blank"
              className="mt-4 text-[15px] flex items-center gap-1"
            >
              <Mail size={14} />
              soni21.shreyans@gmail.com
            </a>
            <img src="/assets/img/mailicon.png" alt="icon" loading="lazy" />
          </div>
          <div className={styles.form}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="message">Message: </label>
            <textarea
              name="message"
              id="message"
              cols={30}
              rows={6}
              required
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>

            <button type="submit" onClick={handleSubmit}>
              SUBMIT
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
