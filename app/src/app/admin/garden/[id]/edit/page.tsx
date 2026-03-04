"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import GardenPieceEditor, { type GardenPieceSaveData } from "@/components/GardenPieceEditor";
import type { GardenPiece } from "@/lib/garden";

export default function EditGardenPiecePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [piece, setPiece] = useState<GardenPiece | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPiece() {
      const res = await fetch(`/api/admin/garden/${id}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setPiece(data.piece);
      setLoading(false);
    }
    fetchPiece();
  }, [id, router]);

  async function handleSave(data: GardenPieceSaveData) {
    const res = await fetch(`/api/admin/garden/${id}`, {
      method: "PUT",
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
      alert(err.error || "Failed to update garden piece");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <span className="font-mono text-xs text-text-secondary tracking-wider">Loading...</span>
      </div>
    );
  }

  if (!piece) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <span className="font-mono text-xs text-text-secondary">Piece not found.</span>
      </div>
    );
  }

  return <GardenPieceEditor initialData={piece} onSave={handleSave} />;
}
