import type { Metadata } from "next";
import { headers } from "next/headers";
import { Bebas_Neue, Playfair_Display, Public_Sans, Roboto_Mono, Homemade_Apple, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "@/components/Navbar";
import NewsletterNavbar from "@/components/NewsletterNavbar";
import Footer from "@/components/Footer";
import NewsletterFooter from "@/components/NewsletterFooter";
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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isNewsletter = host.includes("thedailyvibecode");

  if (isNewsletter) {
    return {
      title: {
        default: "The Daily Vibe Code",
        template: "%s | The Daily Vibe Code",
      },
      description: "Daily curated AI signals, tool launches, research breakthroughs, and builder opportunities. Scannable intelligence for developers and founders.",
      icons: {
        icon: "/assets/img/cube_logo_dark.png",
      },
      openGraph: {
        siteName: "The Daily Vibe Code",
        locale: "en_US",
      },
      alternates: {
        types: {
          "application/rss+xml": "/api/news/rss",
        },
      },
    };
  }

  return {
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
    alternates: {
      types: {
        "application/rss+xml": "/api/news/rss",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isNewsletter = host.includes("thedailyvibecode");

  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${playfairDisplay.variable} ${publicSans.variable} ${robotoMono.variable} ${homemadeApple.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        {isNewsletter ? <NewsletterNavbar /> : <Navbar />}
        <main>{children}</main>
        {isNewsletter ? <NewsletterFooter /> : <Footer />}
        {process.env.NEXT_PUBLIC_GOOGLE && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE} />
        )}
      </body>
    </html>
  );
}
