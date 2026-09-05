import { contacts, profile, skills } from "@/src/content/profile";
import type { Locale } from "@/src/content/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pshenichny.dev";

export function PersonJsonLd({ locale }: { locale: Locale }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name[locale],
    jobTitle: profile.role[locale],
    description: profile.summary[locale],
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location[locale],
    },
    knowsAbout: [...skills],
    sameAs: contacts
      .filter((c) => !c.href.startsWith("mailto:"))
      .map((c) => c.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
