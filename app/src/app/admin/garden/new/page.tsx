"use client";

import { useRouter } from "next/navigation";
import GardenPieceEditor, { type GardenPieceSaveData } from "@/components/GardenPieceEditor";

export default function NewGardenPiecePage() {
  const router = useRouter();

  async function handleSave(data: GardenPieceSaveData) {
    const res = await fetch("/api/admin/garden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      router.push("/admin");
      return;
    }

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create garden piece");
    }
  }

  return <GardenPieceEditor onSave={handleSave} />;
}
