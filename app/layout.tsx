import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Apple n'expose pas SF Pro sur le web : Inter en est le plus proche visuellement
// (même géométrie grotesque neutre, mêmes proportions de chiffres). Sur un
// appareil Apple, le CSS demande d'abord -apple-system, donc c'est la vraie
// SF Pro qui s'affiche ; Inter est le filet de sécurité partout ailleurs.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
