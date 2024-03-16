import Head from 'next/head';
import { Inter } from "next/font/google";
// import './globals.sass'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>SapiensLink</title>
        <meta name="description" content="Sharing knowledge one link at the time." />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="generator" content="Next.js" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
