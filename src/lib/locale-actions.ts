"use server";
import { cookies } from "next/headers";

export async function switchLocale(form: FormData) {
  const locale = form.get("locale");
  if (locale !== "ru" && locale !== "en") return;
  (await cookies()).set("portfolio-locale", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    httpOnly: true,
  });
}
