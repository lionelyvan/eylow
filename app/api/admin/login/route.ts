import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createSessionToken, safeCompare } from "@/lib/session";

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Serveur mal configuré (ADMIN_PASSWORD manquant)." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !safeCompare(password, adminPassword)) {
    // Petite latence pour limiter le bruteforce naïf
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
