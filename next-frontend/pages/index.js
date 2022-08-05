import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { createClient } from "next-sanity";
import PortableText from "react-portable-text";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Portfolio from "../components/portfolio";

export default function Home({ blogs, profile, projects }) {
  var blogisthere = "none";
  if (blogs == null) {
    blogisthere = "true";
  } else {
    blogisthere = "none";
  }
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const builder = imageUrlBuilder(client);
  return (
    <>
      <Navbar color="white" />
      <Head>
        <meta charSet="utf-8" />

        <meta content="IE=edge,chrome=1" httpEquiv="X-UA-Compatible" />

        <meta
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
          name="viewport"
        />
        <title>Homepage | TheLawsBender</title>
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="//" />
        <meta
          name="description"
          content="Personal website for Shreyans Soni. TheLawsBender, languages include NextJS, Sanity.io, JavaScript, Python, C++, DSA, Data Structures and Algorithms, HTML, CSS, Verilog. This website also contains my blogs and projects on Github."
        />
        <link rel="icon" type="image/png" href="/assets/img/favicon.png" />

        <meta name="theme-color" content="#5540af" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />

        <meta property="og:site_name" content="Atom Template" />

        <meta property="og:image" content="//assets/img/social.jpg" />
        <link
          rel="icon"
          href="/assets/img/shreyans1.png"
          type="image/icon type"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400&family=Source+Code+Pro:wght@300;400;700&family=Square+Peg&display=swap"
          rel="stylesheet"
        />
        <meta name="google-site-verification" content="zoIu_lrc5Gw-_uzNUiSMpRl088xH7AbdJoOKq7FDWlQ" />
        <link rel="preload" as="font"/>
      </Head>
      <div className={styles.headercontainer}>
        <div className="text-[30px] font-bold mt-auto mx-14">
          hi, I'm <span>{profile.name}</span>
        </div>
        <div className=" mx-14 text-[16px]">an Avid Coder | Human</div>
        {/* style={{"font-family":"'Square Peg', cursive"}} */}
        <button className="mx-14 mt-5 mb-auto">
          <a href={profile.link} rel="noreferrer" target="_blank">
            Download CV
          </a>
        </button>
      </div>
      <div className="flex flex-col items-center">
        <div className={styles.blogconttitle}>
          <h2>Freshly Baked</h2>
        </div>
        <div className={styles.blogcardcontainer}>
          <span style={{ display: `${blogisthere}` }}>No Blogs Present :/</span>
          {blogs.map((item) => {
            var date = new Date(item.createdAt);
            var month = date.toLocaleString("default", { month: "short" });
            var datetype = date.getUTCDate();
            var year = date.getFullYear();
            return (
              <Link key={item.slug.current} href={"/blog/" + item.slug.current}>
                <div className={styles.blog}>
                  <div
                    style={{
                      backgroundImage: `url(${
                        builder.image(item.blogimage).width(400).url() ||
                        "/assets/img/post-01.png"
                      })`,
                    }}
                    // className="bg-cover bg-center relative h-50 sm:h-64 lg:h-50 xl:h-60 bg-no-repeat"
                    className={styles.blogImg}
                  ></div>
                  <p
                    style={{ fontFamily: "Josefin Sans, sans-serif" }}
                    className="pl-1 pt-2 text-[13px]"
                  >
                    {datetype + " " + month + ", " + year}
                  </p>
                  <h2
                    className=" pl-1 font-bold text-[18px]"
                    style={{ fontFamily: "Josefin Sans, sans-serif" }}
                  >
                    {item.title}
                  </h2>
                  <p
                    className="pl-1 text-[14px]"
                    style={{ fontFamily: "Josefin Sans, sans-serif" }}
                  >
                    {item.metadesc.substring(0, 100)}...
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="py-2 bg-slate-800 w-full flex justify-center">
          <Link href="/blog">
            <span className={styles.readmorebutton}>READ MORE</span>
          </Link>
        </div>
      </div>
      <Portfolio projects={projects}/>
      <Footer />
    </>
  );
}

export async function getServerSideProps(context) {
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const query = `*[_type == "blog"][0...3]`;
  const blogs = await client.fetch(query);

  const profileQuery = `*[_type == "profile"][0]`;
  const profile = await client.fetch(profileQuery);

  const projectsQuery = `*[_type == "projects"]`;
  const projects = await client.fetch(projectsQuery);

  return {
    props: {
      blogs,
      profile,
      projects
    },
  };
}
