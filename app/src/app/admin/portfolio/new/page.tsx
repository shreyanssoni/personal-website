"use client";

import { useRouter } from "next/navigation";
import ProjectEditor from "@/components/ProjectEditor";

export default function NewProjectPage() {
  const router = useRouter();

  async function handleSave(data: {
    title: string;
    description: string;
    image: string;
    codelink: string;
    websitelink: string;
    tags: string[];
    featured: boolean;
    display_order: number;
    published: boolean;
  }) {
    const res = await fetch("/api/admin/portfolio", {
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
      alert(err.error || "Failed to create project");
    }
  }

  return <ProjectEditor onSave={handleSave} />;
}
