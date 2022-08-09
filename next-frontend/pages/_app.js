import "../styles/globals.css";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script id="google-script1"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE}`}
      />
      <Script strategy="lazyOnload" id="google-script2">
        {`
      window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      
        gtag('config', ${process.env.NEXT_PUBLIC_GOOGLE});
    `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
