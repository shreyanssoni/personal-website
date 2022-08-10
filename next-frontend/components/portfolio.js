import React from 'react'
import { createClient } from "next-sanity";
import styles from '../styles/Portfolio.module.css'
// import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

const Portfolio = ({ projects }) => {
    // console.log(projects[0])
    const client = createClient({
        projectId: "p5ragvga",
        dataset: "production",
        apiVersion: "2022-07-26",
        useCdn: false,
      });
    const builder = imageUrlBuilder(client);
  return (
    <>
        <div className={styles.main}>
            <div className='py-2'>
            <div className={styles.heading}>
                <h2>Portfolio</h2>
                </div>
            </div>
            <div className={styles.projects}>
            {
                projects.map((item)=>{
                    if(!item.codelink){
                        item.codelink = `/${item.title}`
                    }
                    if(!item.websitelink)
                        item.websitelink = `/${item.title}`
                    return(
                    <div key={item._id} style={{'backgroundImage': `url(${
                        builder.image(item.projectimage).width(400).url()})`}} className={styles.card}>
                    <div className={styles.overlay}></div>
                    <a rel="noreferrer" target="_blank" href={item.websitelink}  className='z-10'>
                    <h2>{item.title}</h2>
                    </a>
                    <div className={styles.links}>
                        <ul>
                            <li><a href={item.codelink} className='fa fa-github' rel="noreferrer" target="_blank"><span>Code</span></a></li>
                            <li><a href={item.websitelink} className='fa fa-link' rel="noreferrer" target="_blank"><span>Link</span></a></li>
                        </ul>
                    </div>
                    
                </div>
                    )
                })
            }
            </div>
        </div>
    </>
  )
}

export default Portfolio

// export async function getServerSideProps(context) {
//     const client = createClient({
//       projectId: "p5ragvga",
//       dataset: "production",
//       apiVersion: "2022-07-26",
//       useCdn: false,
//     });
//     // const query = `*[_type == "blog"][0...3]`;
//     // const blogs = await client.fetch(query);
  
//     // const profileQuery = `*[_type == "profile"][0]`;
//     // const profile = await client.fetch(profileQuery);
  
//     const projectsQuery = `*[_type == "projects"]`;
//     const projects = await client.fetch(projectsQuery);
//     console.log(projects)
//     return {
//       props: {
//         // blogs,
//         // profile,
//         projects
//       },
//     };
//   }