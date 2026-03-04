export default function SectionLabel({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`font-mono text-xs tracking-[0.2em] uppercase text-text-secondary ${className}`}>
      {"// "}{text}
    </span>
  );
}
