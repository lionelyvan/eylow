import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Eylow — Artiste & Compositeur",
  description:
    "Eylow explore les frontières du son : mélodie, électronique et rythmes organiques. Écoute, univers, contact.",
  keywords: ["Eylow", "musique", "artiste", "compositeur", "rap", "électronique"],
  openGraph: {
    title: "Eylow — Artiste & Compositeur",
    description: "Un son. Une énergie. Découvre l'univers musical d'Eylow.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bebasNeue.variable} ${spaceMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
