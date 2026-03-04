"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Keyboard } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/Chat.module.css";

type Message = [content: string, sender: string, type: string];

const USER_STATUSES = [
  " ",
  "loading ",
  "tokenizing ",
  "comprehending ",
  "fetching ",
  "decoding ",
];

function generateSessionId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sessionId = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sessionId="))
    ?.split("=")[1];
  if (!sessionId) {
    sessionId = generateSessionId();
    document.cookie = `sessionId=${sessionId}; path=/`;
  }
  return sessionId;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    ["Hi there! What's your name? \u{1F4AD}", "Bot", "txt"],
  ]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [status] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 20);
    getSessionId();
  }, []);

  useEffect(() => {
    toast("Secret: type in /download to download the resume!", {
      position: "top-center",
      icon: "\u{1F92B}",
    });
    toast("Heyyyy there!", {
      position: "top-center",
      icon: "\u{1F984}",
    });
  }, []);

  const sendMessage = async (event: React.FormEvent | React.KeyboardEvent) => {
    event.preventDefault();
    if (message.includes("\u2764\uFE0F")) {
      toast("\u{1F496}\u{1F496}\u{1F496}", { icon: "\u{1F984}" });
    }

    if (message) {
      setIsTyping(true);
      const newMsg = message;
      const sessionId = getSessionId();
      setMessages((prev) => [...prev, [message, "Shreyans", "txt"]]);
      setMessage("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: sessionId, message: newMsg }),
        });

        const result = await response.json();
        if (!result.success) {
          setMessages((prev) => [
            ...prev,
            ["Error occurred in the pipeline.", "Bot", "txt"],
          ]);
        } else {
          setMessages((prev) => [...prev, [result.updatedData, "Bot", "txt"]]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          ["Something went wrong. Try again!", "Bot", "txt"],
        ]);
      }

      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      sendMessage(event);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Toaster />
      <Navbar />
      <div className={styles.mainContainer}>
        <div className={styles.glowingBorder}>
          <div className={styles.chatCard}>
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>
                <img src="/assets/img/shreyans1.png" alt="profile" />
              </div>
              <div className={styles.headerInfo}>
                <h3>Shreyans (bot)</h3>
                <p>{isTyping ? "typing..." : "online"}</p>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.cardCont} ref={scrollContainerRef}>
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.messageRow} ${
                    item[1] === "Bot"
                      ? styles.messageRowBot
                      : styles.messageRowUser
                  }`}
                >
                  <div style={{ maxWidth: "300px", padding: "2px" }}>
                    {item[2] === "txt" && (
                      <div
                        className={`${styles.messageBubble} ${
                          item[1] === "Bot"
                            ? styles.messageBubbleBot
                            : styles.messageBubbleUser
                        }`}
                      >
                        {item[0].includes("<<Link>>") ? (
                          <span>
                            {item[0].split("<<Link>>")[0]}
                            <a
                              href={item[0].split("<<Link>>")[1]}
                              target="_blank"
                              rel="noreferrer"
                              style={{ textDecoration: "underline" }}
                            >
                              Download Resume
                            </a>
                          </span>
                        ) : (
                          item[0]
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={styles.typingIndicator}>
                  <div>{USER_STATUSES[status]}</div>
                  <div className={styles.typing}> . . .</div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Keyboard size={18} />
                </div>
                <textarea
                  className={styles.chatInput}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  value={message}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button className={styles.sendButton} onClick={sendMessage}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
