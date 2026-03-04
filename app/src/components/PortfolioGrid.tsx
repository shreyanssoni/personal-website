import { Github, Link as LinkIcon } from "lucide-react";
import styles from "@/styles/Portfolio.module.css";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  codelink: string;
  websitelink: string;
}

export default function PortfolioGrid({
  projects,
  limit,
}: {
  projects: Project[];
  limit?: number;
}) {
  const items = limit ? projects.slice(0, limit) : projects;

  return (
    <div className={styles.main}>
      <div className="py-2">
        <div className={styles.heading}>
          <h2>Portfolio</h2>
        </div>
      </div>
      <div className={styles.projects}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{ backgroundImage: `url(${item.image})` }}
            className={styles.card}
          >
            <div className={styles.overlay}></div>
            <a
              rel="noreferrer"
              target="_blank"
              href={item.websitelink || "#"}
              className="z-10"
            >
              <h2>{item.title}</h2>
            </a>
            <div className={styles.links}>
              <ul>
                <li>
                  <a
                    href={item.codelink || "#"}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Github size={16} />
                    <span>Code</span>
                  </a>
                </li>
                <li>
                  <a
                    href={item.websitelink || "#"}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LinkIcon size={16} />
                    <span>Link</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
