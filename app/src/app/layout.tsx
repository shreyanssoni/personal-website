import type { Metadata } from "next";
import { Josefin_Sans, Montserrat, Source_Code_Pro, Square_Peg, Nunito } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
  display: "swap",
});

const squarePeg = Square_Peg({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-square-peg",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
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
      className={`${josefin.variable} ${montserrat.variable} ${sourceCode.variable} ${squarePeg.variable} ${nunito.variable}`}
    >
      <body>
        {children}
        {process.env.NEXT_PUBLIC_GOOGLE && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE} />
        )}
      </body>
    </html>
  );
}
