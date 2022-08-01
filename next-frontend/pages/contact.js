import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Contact.module.css";
import { createClient } from "next-sanity";
import Navbar from "../components/Navbar";
import Footer from '../components/Footer'


const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState('');
  function postValue(e) {
    e.preventDefault();
    const client = createClient({
      projectId: "p5ragvga",
      dataset: "production",
      apiVersion: "2022-07-26",
      token: `${process.env.NEXT_PUBLIC_TOKEN}`,
      useCdn: true,
    });

    const doc = {
      _type: "form",
      name: name,
      email: email,
      message: message,
    };

    // client
    // .delete({query: '*[_type == "form"][0...999]'})
    // .then(console.log)
    // .catch(console.error)

    if(name=='' || email=='' || message==''){
      setAlert('Please fill all the entries!')
      document.getElementById('alert').style.display = 'inline';
      setTimeout(() => {  
        document.getElementById('alert').style.display = 'none';
      }, 3000);
    }
    else{
      client.create(doc).then(async (res) => {
        if (res._id != undefined || res._id != null) {
          setName('');
          setEmail('');
          setMessage('');
        document.getElementById('alert').style.display = 'inline';
        setAlert('Thank you for the response!');
        setTimeout(() => {  
          document.getElementById('alert').style.display = 'none';
        }, 3000);
      } else {
      }
    });
  }
  }

  return (
    <>
    <Navbar color='black'/>
      <Head>
        <title> Contact | TheLawsBender</title>
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
      </Head>
      <div id='alert' style={{'display': 'none'}} className={styles.alert}>{alert}</div>
         
      <div
        style={{ background: "#fcf1e9" }}
        className={styles.main}
      >
        <div className={styles.containercontact}>
          <div className={styles.info}>
            <h2 className="text-[24px] text-black">Let's Connect!</h2>
            <a
              href="mailto: soni21.shreyans@gmail.com"
              rel="noreferrer"
              target="_blank"
              className="mt-4 text-[15px]"
            >
              <span className="fa fa-envelope text-[14px] p-1 mr-1"></span>
              soni21.shreyans@gmail.com
            </a>
            <img src="/assets/img/mailicon.png" alt="icon" />
          </div>
          <div className={styles.form}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your Name"
              value={name}
              required
              onChange={(e) => {
                setName(e.target.value);
              }}
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />

            <label htmlFor="message">Message: </label>
            <textarea
              name="message"
              id="message"
              cols="30"
              rows="6"
              required
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            ></textarea>

            <button type="submit" onClick={postValue}>SUBMIT</button>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Contact;
