import { cookies } from "next/headers";
import type { Locale } from "@/src/content/types";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get("portfolio-locale")?.value === "en" ? "en" : "ru";
}
