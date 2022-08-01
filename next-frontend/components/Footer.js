import React, { useEffect, useState } from 'react'
import styles from "../styles/Home.module.css"
import { createClient } from "next-sanity";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [val, setVal] = useState([true, 'text-red-800'])
  const [message, setMessage] = useState('')
  useEffect(() => {
    setTimeout(() => {
      setMessage(null);
    }, 5000);
    return () => {
      message
    }
  }, [message])
  

  function postValue(e){
    e.preventDefault();
    if(email == null || email == ''){
      setMessage('Please type valid email');
      setVal([true, 'text-red-800']);
    }
    else{
      const client = createClient({
      projectId: "p5ragvga",
      dataset: "production",
      apiVersion: "2022-07-26",
      token: `${process.env.NEXT_PUBLIC_TOKEN}`,
      useCdn: true,
    });
  
    const doc = {
      _type: "subscribers",
      email: email,
    };
    
    client.create(doc).then( async (res) => {
      if(res._id != undefined || res._id != null){
        setEmail('');
        setVal([false, 'text-green-800']);
        setMessage('Merci beacoup!');
      }
      else{
        setVal([true,'text-red-800'])
        setMessage('Internal Error Occured');
      }
    });
  }
};

  return (
    <>
    <div>
        <div className={styles.form}>
            <form>
            <input type="email" name='email' value ={email} placeholder='Enter your email' onChange={(e)=>{
              setEmail(e.target.value)
              }}/>
            <button onClick={postValue}>Subscribe</button>
            </form>
          </div>
        <p style={{'fontFamily': 'Montserrat, sans-serif', 'display': `${val[0]}` }} className={`px-2 pt-0.5 text-[16px] text-center ${val[1]} `}>{message}</p>
        <div className= {styles.footerblog}>
            <ul className='flex flex-row p-2'>
                <li><a href="https://www.facebook.com/sonishreyans/" className='fa fa-facebook text-[20px] p-3 mx-4' rel="noreferrer" target="_blank"></a></li>
                <li><a href="https://www.linkedin.com/in/shreyans-soni/" className='fa fa-linkedin' rel="noreferrer" target="_blank"></a></li>
                <li><a href="mailto: soni21.shreyans@gmail.com" className='fa fa-envelope' rel="noreferrer" target="_blank"></a></li>
                <li><a href="https://github.com/shreyanssoni" className='fa fa-github' rel="noreferrer" target="_blank"></a></li>
                <li><a href="https://www.instagram.com/shreyans.not.h/" className='fa fa-instagram' rel="noreferrer" target="_blank"></a></li>
                <li><a href="#" className='fa fa-twitter' rel="noreferrer" target="_blank"></a></li>
            </ul>
        </div>
        <div className={styles.footercontent}>
            THELAWSBENDER | SHREYANS SONI
        </div>
        <p style={{'fontFamily': 'Josefin Sans, sans-serif'}} className='text-center mb-2 -mt-2 mr-3 text-[11px]'>Coded using <a rel="noreferrer" target="_blank" href="https://nextjs.org/">Next.js</a> and <a rel="noreferrer" target="_blank" href="https://www.sanity.io/">Sanity.io</a></p>
    </div>
    </>
  )
}

export default Footer


// export async function getServerSideProps(context) {
//   const client = createClient({
//     projectId: "p5ragvga",
//     dataset: "production",
//     apiVersion: "2022-07-26",
//     token: 'skXf1xmGh4pp8XE3ywSoZjKN4NdZmnMB356tltM1W15XHg828JsR9gaz6kfodYAsnx3yAwwyuWzHccqB6nZneRYpjYMFvHf5Rp6qpnmcqXvObahuFFXdHbNFSKesuj4sQOyNriovuzVZnXyCn3fC0yzs5OifUcGt4C1NY8uLQrFsAsVAujtZ',
//     useCdn: false,
//   });

//   const doc = {
//     _type: "email",
//     name: 'soni21.shreyans@gmail.com',
//   };
//     client.create(doc).then((res) => {
//     console.log(`Bike was created, document ID is ${res._id}`);
// });
    

// return {
//     props:{
//         doc
//     }
// }
// }