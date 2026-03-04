"use client";

import { ArrowLeft } from "lucide-react";

export default function BlogBackButton() {
  return (
    <span
      className="mb-2 cursor-pointer inline-block"
      onClick={() => history.back()}
    >
      <ArrowLeft size={24} />
    </span>
  );
}
