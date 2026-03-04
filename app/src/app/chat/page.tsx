"use client";

import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import GradientBlobs from "@/components/GradientBlobs";
import GlassCard from "@/components/GlassCard";
import SectionLabel from "@/components/SectionLabel";

type Message = [content: string, sender: string, type: string];

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
    ["Hi there! What's your name?", "Bot", "txt"],
  ]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    getSessionId();
  }, []);

  const sendMessage = async (event: React.FormEvent | React.KeyboardEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setIsTyping(true);
    const newMsg = message;
    const sessionId = getSessionId();
    setMessages((prev) => [...prev, [message, "User", "txt"]]);
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
          ["Something went wrong. Try again!", "Bot", "txt"],
        ]);
      } else {
        setMessages((prev) => [...prev, [result.updatedData, "Bot", "txt"]]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        ["Network error. Try again!", "Bot", "txt"],
      ]);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
      <GradientBlobs
        color1="rgba(0, 245, 212, 0.1)"
        color2="rgba(0, 229, 255, 0.06)"
        color3="rgba(255, 45, 133, 0.04)"
      />

      <div className="relative mx-auto max-w-2xl px-6 w-full">
        <div className="text-center mb-8">
          <SectionLabel text="AI_CHAT" className="mb-3 block" />
          <h1 className="font-display text-4xl sm:text-5xl text-text-primary">
            TALK TO <span className="text-accent-teal">SHREYANS</span>
          </h1>
          <p className="font-body text-sm text-text-secondary mt-3">
            An AI that knows a bit about me. Ask anything!
          </p>
          <p className="font-mono text-[10px] text-text-secondary/50 mt-2">
            Tip: type /download to get the resume
          </p>
        </div>

        <div className="glowing-border rounded-2xl">
          <GlassCard className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-raised">
                <img
                  src="/assets/img/shreyans1.png"
                  alt="Shreyans"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-body text-sm font-semibold text-text-primary">
                  Shreyans (bot)
                </h3>
                <p className="font-mono text-[10px] text-accent-teal">
                  {isTyping ? "typing..." : "online"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((item, index) => {
                const isBot = item[1] === "Bot";
                return (
                  <div
                    key={index}
                    className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed ${
                        isBot
                          ? "bg-surface-raised text-text-primary rounded-bl-sm"
                          : "bg-accent-teal/20 text-text-primary rounded-br-sm"
                      }`}
                    >
                      {item[0].includes("<<Link>>") ? (
                        <span>
                          {item[0].split("<<Link>>")[0]}
                          <a
                            href={item[0].split("<<Link>>")[1]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent-teal underline"
                          >
                            Download Resume
                          </a>
                        </span>
                      ) : (
                        item[0]
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-raised rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent-teal/60 typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-accent-teal/60 typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-accent-teal/60 typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-teal/40 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-accent-teal text-midnight px-4 py-3 rounded-xl hover:bg-accent-teal/90 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
