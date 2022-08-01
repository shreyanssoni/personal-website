import React from "react";
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/Blog.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Search functionality using GROQ text match
const Blog = ({ blogs }) => {
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const builder = imageUrlBuilder(client);
  var sortedBlog = blogs.slice().sort((a, b) => {
    let date1 = new Date(a.createdAt);
    let date2 = new Date(b.createdAt);
    return Number(date2) - Number(date1);
  });
  // console.log("sorted", sortedBlog)
  return (
    <>
      <Navbar color="white" />
      <Head>
        <title>Blogs | TheLawsBender</title>
        <link
          rel="icon"
          href="/assets/img/shreyans1.png"
          type="image/icon type"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400&family=Source+Code+Pro:wght@300;400;700&family=Square+Peg&display=swap"
          rel="stylesheet"
        />
        <meta name="google-site-verification" content="zoIu_lrc5Gw-_uzNUiSMpRl088xH7AbdJoOKq7FDWlQ" />
      </Head>
      <div className={styles.blogheader}>
        <div className={styles.innerdivblog}>
          <h2
            style={{ fontFamily: "Source Code Pro, monospace" }}
            className={styles.headerblogtitle}
          >
            Tech. Entrepreneurship. Electronics. Psychology?
          </h2>
          <p
            className={styles.headerblogtitlep}
            style={{ fontFamily: "Source Code Pro, monospace" }}
          >
            That's me. That's{" "}
            <span
              className="text-[28px]"
              style={{ fontFamily: "Square Peg, cursive" }}
            >
              {" "}
              Shreyans.{" "}
            </span>
          </p>
          {/* <p className='pl-3 text-[18px]' style={{'fontFamily' : "Source Code Pro, monospace"}}>THELAWSBENDER</p> */}
        </div>
      </div>
      <div className={styles.maindiv}>
        <div className={styles.blogcardcontainer}>
          {sortedBlog.map((item) => {
            // var tagArr = [];
            // item.tags.map(element => {
            //   tagArr.push(element.value);
            // })
            // const tagsString = tagArr.slice(0,2).join(', ');
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
                  <div className="py-1 pl-0.5">
                    {/* <span id={styles.tags} style={{'fontFamily' : "Josefin Sans, sans-serif"}} className='p-1 px-1 text-[13px] text-black bg-white rounded-lg'>{tagsString}</span>
                  <span className={styles.dash}>-</span>  */}
                    <span
                      style={{ fontFamily: "Josefin Sans, sans-serif" }}
                      className={styles.date}
                    >
                      {getDate(item.createdAt)}
                    </span>
                  </div>
                  <h2
                    className={styles.titleblog}
                    style={{ fontFamily: "Josefin Sans, sans-serif" }}
                  >
                    {item.title}
                  </h2>
                  <p
                    className={styles.metastring}
                    style={{ fontFamily: "Josefin Sans, sans-serif" }}
                  >
                    {item.metadesc.substring(0, 150)}...
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;

function getDate(date) {
  var date = new Date(date);
  var month = date.toLocaleString("default", { month: "short" });
  var datetype = date.getUTCDate();
  var year = date.getFullYear();

  return datetype + " " + month + ", " + year;
}

export async function getServerSideProps(context) {
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const query = `*[_type == "blog"]`;
  const blogs = await client.fetch(query);
  return {
    props: {
      blogs,
    },
  };
}
