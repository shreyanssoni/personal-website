import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioGrid from "@/components/PortfolioGrid";
import projects from "@/data/projects.json";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function Portfolio() {
  return (
    <>
      <Navbar color="white" />
      <PortfolioGrid projects={projects} />
      <Footer />
    </>
  );
}
