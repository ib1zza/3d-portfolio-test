import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Hud } from "@/src/ui/hud/Hud";
import { getLocale } from "@/src/lib/locale";
import { ProjectHandoff } from "@/src/motion/ProjectHandoff";
import { WebGLRoot } from "@/src/webgl/WebGLRoot";
import { profile } from "@/src/content/profile";
import { pick, translate } from "@/src/content/i18n";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pshenichny.dev";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${pick(profile.name, locale)} — ${pick(profile.role, locale)}`,
      template: `%s — ${pick(profile.name, locale)}`,
    },
    description: pick(profile.summary, locale),
    authors: [{ name: pick(profile.name, locale), url: SITE_URL }],
    openGraph: {
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? "en_US" : "ru_RU",
      siteName: pick(profile.name, locale),
      title: `${pick(profile.name, locale)} — ${pick(profile.role, locale)}`,
      description: pick(profile.summary, locale),
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#e9e5dd",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const fonts = `${inter.variable} ${jetbrainsMono.variable}`;

  // Переменные шрифтов должны жить на :root: --font-display и остальные
  // токены в globals.css объявлены там же и подставляются в точке объявления.
  return (
    <html lang={locale} className={fonts} suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#content">
          {translate(locale, "a11y.skipToContent")}
        </a>
        <Link className="skip-link" href="/#contacts">
          {translate(locale, "a11y.skipToContacts")}
        </Link>

        {/* WebGL живёт в layout, а не на странице: так сцена переживает
            смену роута и контекст не пересоздаётся. */}
        <WebGLRoot />

        <Hud locale={locale} name={pick(profile.name, locale)} />
        <ProjectHandoff />

        {children}
      </body>
    </html>
  );
}
