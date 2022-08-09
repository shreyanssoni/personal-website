import "../styles/globals.css";
import Script from "next/script";
import { useEffect, useState } from "react";
import NextNProgress from "nextjs-progressbar";

function MyApp({ Component, pageProps }) {
  // NProgress.configure({ showSpinner: false });
  return (
    <>
   <NextNProgress color="white" height={2} options={{showSpinner: false}}/>
   
    {/* <Script strategy="lazyOnload" src={`https://www.googleoptimize.com/optimize.js?id=${process.env.NEXT_PUBLIC_OPTID}`}/> */}
      <Script id="google-script1"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE}`}
      />
      <Script strategy="lazyOnload" id="google-script2">
        {`
      window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE}');
    `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
