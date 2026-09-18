import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chippie.ve - Comparador de precios en tiendas venezolanas",
  description: "Compara precios de productos entre farmacias, supermercados y tiendas de Caracas. Encuentra la mejor oferta al instante.",
  keywords: ["tiendas", "farmacias", "supermercados", "precios", "medicamentos", "Caracas", "Venezuela", "comparador", "ahorro"],
  authors: [{ name: "Chippie.ve" }],
  openGraph: {
    title: "Chippie.ve - Comparador de precios en tiendas",
    description: "Compara precios entre farmacias, supermercados y tiendas al instante",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chippie.ve - Comparador de precios en tiendas",
    description: "Compara precios entre farmacias, supermercados y tiendas",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
