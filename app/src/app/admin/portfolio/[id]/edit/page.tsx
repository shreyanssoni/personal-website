"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProjectEditor from "@/components/ProjectEditor";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  image: string;
  codelink: string;
  websitelink: string;
  tags: string[];
  featured: boolean;
  display_order: number;
  published: boolean;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      const res = await fetch(`/api/admin/portfolio/${id}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setProject(data.project);
      setLoading(false);
    }
    fetchProject();
  }, [id, router]);

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
    const res = await fetch(`/api/admin/portfolio/${id}`, {
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
      alert(err.error || "Failed to update project");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <span className="font-mono text-xs text-text-secondary tracking-wider">
          Loading...
        </span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <span className="font-mono text-xs text-text-secondary tracking-wider">
          Project not found.
        </span>
      </div>
    );
  }

  return <ProjectEditor initialData={project} onSave={handleSave} />;
}
