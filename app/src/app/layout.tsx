import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Public_Sans, Roboto_Mono, Homemade_Apple, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const homemadeApple = Homemade_Apple({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-soft",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The MicroBits | Shreyans Soni",
    template: "%s | The MicroBits",
  },
  description:
    "The MicroBits is a personal website developed by Shreyans Soni. The website includes personal blogs written by Shreyans and an updated About Page comprising of a short description, resume, projects and the fields of interest.",
  icons: {
    icon: "/assets/img/shreyans1.png",
  },
  verification: {
    google: "zoIu_lrc5Gw-_uzNUiSMpRl088xH7AbdJoOKq7FDWlQ",
  },
  openGraph: {
    siteName: "The MicroBits",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${playfairDisplay.variable} ${publicSans.variable} ${robotoMono.variable} ${homemadeApple.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <Navbar />
        <main>{children}</main>
        <Footer />
        {process.env.NEXT_PUBLIC_GOOGLE && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE} />
        )}
      </body>
    </html>
  );
}
