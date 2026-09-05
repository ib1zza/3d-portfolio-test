import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Unbounded } from "next/font/google";

import { Hud } from "@/src/ui/hud/Hud";
import { ThemeScript } from "@/src/ui/theme/ThemeScript";
import { getLocale } from "@/src/lib/locale";
import { WebGLRoot } from "@/src/webgl/WebGLRoot";
import { profile } from "@/src/content/profile";
import { pick, translate } from "@/src/content/i18n";

import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name.ru} — ${profile.role.ru}`,
    template: `%s — ${profile.name.ru}`,
  },
  description: profile.summary.ru,
  authors: [{ name: profile.name.ru, url: SITE_URL }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: "en_US",
    siteName: profile.name.ru,
    title: `${profile.name.ru} — ${profile.role.ru}`,
    description: profile.summary.ru,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/", languages: { ru: "/", en: "/en" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#08080b" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const fonts = `${unbounded.variable} ${inter.variable} ${jetbrainsMono.variable}`;

  // Переменные шрифтов должны жить на :root: --font-display и остальные
  // токены в globals.css объявлены там же и подставляются в точке объявления.
  return (
    <html lang={locale} className={fonts} suppressHydrationWarning>
      <body>
        <ThemeScript />

        <a className="skip-link" href="#content">
          {translate(locale, "a11y.skipToContent")}
        </a>
        <a className="skip-link" href="#contacts">
          {translate(locale, "a11y.skipToContacts")}
        </a>

        {/* WebGL живёт в layout, а не на странице: так сцена переживает
            смену роута и контекст не пересоздаётся. */}
        <WebGLRoot />

        <Hud locale={locale} name={pick(profile.name, locale)} />

        {children}
      </body>
    </html>
  );
}
