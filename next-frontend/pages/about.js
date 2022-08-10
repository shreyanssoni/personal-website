import React from 'react'
import Head from 'next/head'
import styles from '../styles/About.module.css'
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import PortableText from "react-portable-text";
import Navbar from "../components/Navbar";
import Footer from '../components/Footer'
// import Image from 'next/image';
import Portfolio from '../components/portfolio';
import Image from 'next/image';

const About = ({profile, projects}) => {
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });
  const builder = imageUrlBuilder(client);
  const url = builder.image(profile.image).width(500).url();
  if(url == undefined || url == null){
    url = '/assets/img/abouticon.jpg';
  } 
  return (
    <>
    <Navbar color = 'white'/>
    <Head>
        <title> About | The MicroBits</title>
        <meta name="description" content='I am Shreyans Soni, a pre-final year student pursuing Electronics and Instrumentation from BITS Pilani, Hyderabad Campus. With having discovered special interest in creation, design and development, I have been involved in Web dev for more than a year. My other interests include tinkering with electronic components, making sounds using guitar and hitting a shuttle with badminton racket. '/>
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400&family=Source+Code+Pro:wght@300;400;700&family=Square+Peg&display=swap"
          rel="stylesheet"
        />
        <meta name="google-site-verification" content="zoIu_lrc5Gw-_uzNUiSMpRl088xH7AbdJoOKq7FDWlQ" />
        <link rel="preload" as="font"/>
      </Head>
      <div className={styles.maincontainer}>
        <div className={styles.aboutcontainer}>
          <div className={styles.aboutname}>
            <div className={styles.aboutimage}>
            {/* <img src={url} alt="Avatar" /> */}
            <Image loader={()=>url} src={url} className={styles.imgIcon} alt='Avatar' width={280} height={450} loading='lazy' />
            </div>
            <h2 className='text-[25px] font-bold'>{profile.name}</h2>
            <hr className='w-12 m-auto my-5' />
            <p className='uppercase tracking-wide text-[16px]	'>{profile.title}</p>
            <div className={styles.aboutlinks}>
            <ul className='flex flex-row p-2'>
                <li><a href="https://www.linkedin.com/in/shreyans-soni/" className='fa fa-linkedin text-[22px] p-2 mx-3' rel="noreferrer" target="_blank"></a></li>
                <li><a href="mailto: soni21.shreyans@gmail.com" className='fa fa-envelope text-[22px] p-2 mx-3' rel="noreferrer" target="_blank"></a></li>
                <li><a href="https://github.com/shreyanssoni" className='fa fa-github text-[22px] p-2 mx-3' rel="noreferrer" target="_blank"></a></li>
            </ul>
            </div>
          </div>
          <div className={styles.aboutcontent}>
          <h1 className='text-[60px] font-bold'>Hello</h1>
          <p className='font-semibold text-[18px]'>Here's who I am & what I do</p>
          <div className='my-5'>
            <span className={styles.l1}><a href={profile.link} rel="noreferrer" target='_blank'> Resume </a></span>
            <span className={styles.l2}><a href={profile.projects} rel="noreferrer" target='_blank'> Projects </a></span>
          </div>
          <div className={styles.aboutinfo}>
          <PortableText
            // Pass in block content straight from Sanity.io
            content={profile.about}
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
        </div>
      </div>
      <Portfolio projects={projects}/>
      <Footer/>
    </>
  )
}

export default About

export async function getServerSideProps(context) {
  const client = createClient({
    projectId: "p5ragvga",
    dataset: "production",
    apiVersion: "2022-07-26",
    useCdn: false,
  });

  const profileQuery = `*[_type == "profile"][0]`;
  const profile = await client.fetch(profileQuery);

  const projectsQuery = `*[_type == "projects"]`;
  const projects = await client.fetch(projectsQuery);

  return {
    props: {
      profile,
      projects
    }
  };
}