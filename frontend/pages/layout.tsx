import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import './globals.sass'

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "SapiensLink",
//   description: "Sharing knowledge one link at the time.",
//   generator: "Next.js",
//   manifest: "/manifest.json",
//   themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
//   authors: [
//     { name: "Pier Paolo Ippolito" },
//     {
//       name: "Pier Paolo Ippolito",
//       url: "https://ppiconsulting.dev/",
//     },
//   ],
//   viewport:
//     "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
//   icons: [
//     { rel: "apple-touch-icon", url: "logo.svg" },
//     { rel: "icon", url: "logo.svg" },
//   ],
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

