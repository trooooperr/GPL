import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-lexend",
  display: "swap",
});

export const viewport = {
  themeColor: "#081a36",
};

export const metadata = {
  title: "Goregaon Premier League (GPL) - Radhe Radhe Chashak",
  description: "Official website of Goregaon Premier League organised by Mohsin Patel & Balram Gupta (Ballu). Ward 51-54 Goregaon East.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GPL Cricket"
  },
  icons: {
    icon: "/images/gpl-logo.png",
    apple: "/images/gpl-logo.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lexend.variable} font-sans`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#081a36" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#f6f8f6] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
