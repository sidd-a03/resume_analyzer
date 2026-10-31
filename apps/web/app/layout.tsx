import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { brand } from "@/constants/brand";
import { Providers } from "@/provider/providers";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

// Handwriting, used only for red-pen margin notes on the mock resume.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: `${brand.name}: AI resume review and job match`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name}: ${brand.tagline}`,
    description: brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name}: ${brand.tagline}`,
    description: brand.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#131311" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${fraunces.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
