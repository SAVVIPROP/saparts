import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Inter } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import { getCities } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const markets = getCities().length;
  const description = `An independent, source-backed index of serviced apartments and aparthotels across ${markets} published markets. Listings are reviewed for factual content, location, and property imagery.`;
  return {
    title: {
      default: "SAparts — The World's Leading Independent Serviced Apartment Directory",
      template: "%s — SAparts",
    },
    description,
    metadataBase: new URL("https://saparts.vercel.app"),
    alternates: { canonical: "/" },
    openGraph: {
      title: "SAparts — World's Leading Directory of Serviced Apartments",
      description: `Official serviced apartments across ${markets} published markets. Source-backed listings only — rates appear when the pack files them.`,
      url: "https://saparts.vercel.app",
      siteName: "SAparts",
      type: "website",
      locale: "en_GB",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${instrument.variable} ${ibm.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
