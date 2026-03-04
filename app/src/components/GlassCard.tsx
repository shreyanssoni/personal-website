import { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={`${light ? "glass-card-light" : "glass-card"} rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
