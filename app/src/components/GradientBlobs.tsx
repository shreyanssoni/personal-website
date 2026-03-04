export default function GradientBlobs({
  color1 = "rgba(0, 229, 255, 0.15)",
  color2 = "rgba(255, 45, 133, 0.1)",
  color3 = "rgba(0, 245, 212, 0.08)",
}: {
  color1?: string;
  color2?: string;
  color3?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px] animate-blob-float"
        style={{ background: color1 }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full blur-[100px] animate-blob-float-delayed"
        style={{ background: color2 }}
      />
      <div
        className="absolute top-1/2 left-1/3 h-[350px] w-[350px] rounded-full blur-[100px] animate-blob-float-slow"
        style={{ background: color3 }}
      />
    </div>
  );
}
