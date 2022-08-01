import { useRouter } from "next/router";
import Head from "next/head";
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import PortableText from "react-portable-text";
import Link from "next/link";
import styles from "../../styles/Blog.module.css";
import Navbar from "../../components/Navbar";
import Footer from '../../components/Footer'

const Blog = ({ blog, author }) => {
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const builder = imageUrlBuilder(client);
  const router = useRouter();
  const { slug } = router.query;
  const url = builder.image(blog.blogimage).width(1000).url();
  if (url == undefined || url == null) {
    url = "/assets/img/header-img1.jpg";
  }
  return (
    <>
    <Navbar color= 'black'/>
      <Head>
        <title> {blog.title} | TheLawsBender</title>
        <link
          rel="icon"
          href="/assets/img/shreyans1.png"
          type="image/icon type"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
      </Head>

      <div className={styles.blogmaindiv} style={{ background: "#ffeddf" }}>
        <div className={styles.pagecontent}>
          <div className={styles.blogdate}>
            {getDate(blog.createdAt)} &#183; {author[0].title}{" "}
          </div>
          {/* <span onClick={} className='ml-1 text-lg fa fa-share-alt' style={{}}></span> */}
          <div className={styles.blogtitle}>{blog.title}</div>
          <div>
            {blog.tags.map((element) => {
              return (
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    background: "#dc7561",
                  }}
                  className="py-0.5 px-2 mr-0.5 width text-[11px] text-white rounded-xl"
                >
                  {" "}
                  {element.value}{" "}
                </span>
              );
            })}
          </div>
          {/* <div className="p-1 px-2 width text-[13px] text-white bg-gray-600 rounded-xl">{tagsString}</div> */}

          <div className={styles.metadesc}>{blog.metadesc}</div>
          <div className={styles.blogimage}>
            <img src={url} alt={blog.title} />
          </div>
          <PortableText
            className={styles.blogcontent}
            // Pass in block content straight from Sanity.io
            content={blog.content}
            projectId="p5ragvga"
            dataset="production"
            // Optionally override marks, decorators, blocks, etc. in a flat
            // structure without doing any gymnastics
            serializers={{
              h1: (props) => <h1 style={{ color: "red" }} {...props} />,
              li: ({ children }) => (
                <li className="special-list-item">{children}</li>
              ),
            }}
          />
        </div>
      </div>
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
  const { slug } = context.query;
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const query = `*[_type == "blog" && slug.current == '${slug}'][0]`;
  const blog = await client.fetch(query);

  const authquery = `*[_type == "author" && _id == '${blog.author.author._ref}']`;
  const author = await client.fetch(authquery);
  return {
    props: {
      blog,
      author,
    },
  };
}