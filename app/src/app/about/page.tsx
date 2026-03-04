import type { Metadata } from "next";
import { Linkedin, Mail, Github } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioGrid from "@/components/PortfolioGrid";
import profile from "@/data/profile.json";
import projects from "@/data/projects.json";
import styles from "@/styles/About.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "I am Shreyans Soni, a graduate in Electronics and Instrumentation from BITS Pilani, Hyderabad Campus. With having discovered special interest in creation, development and writing, I have been involved in AI and Web dev for more than two years.",
};

export default function About() {
  return (
    <>
      <Navbar color="white" />
      <div className={styles.maincontainer}>
        <div className={styles.aboutcontainer}>
          <div className={styles.aboutname}>
            <div className={styles.aboutimage}>
              <img src={profile.image} alt="Avatar" loading="lazy" />
            </div>
            <h2 className="text-[25px] font-bold">{profile.name}</h2>
            <hr className="w-12 m-auto my-5" />
            <p className="uppercase tracking-wide text-[16px]">
              {profile.title}
            </p>
            <div className={styles.aboutlinks}>
              <ul className="flex flex-row p-2 list-none">
                <li>
                  <a
                    href={profile.socials.linkedin}
                    className="text-[22px] p-2 mx-3"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Linkedin size={22} />
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${profile.socials.email}`}
                    className="text-[22px] p-2 mx-3"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Mail size={22} />
                  </a>
                </li>
                <li>
                  <a
                    href={profile.socials.github}
                    className="text-[22px] p-2 mx-3"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Github size={22} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.aboutcontent}>
            <h1 className="text-[60px] font-bold">Hello</h1>
            <p className="font-semibold text-[18px]">
              Here&apos;s who I am &amp; what I do
            </p>
            <div className="my-5">
              <span className={styles.l1}>
                <a href={profile.link} rel="noreferrer" target="_blank">
                  Resume
                </a>
              </span>
              <span>
                <a href={profile.projects} rel="noreferrer" target="_blank">
                  Projects
                </a>
              </span>
            </div>
            <div
              className={styles.aboutinfo}
              dangerouslySetInnerHTML={{ __html: profile.aboutHtml }}
            />
          </div>
        </div>
      </div>
      <PortfolioGrid projects={projects} limit={3} />
      <Footer />
    </>
  );
}
