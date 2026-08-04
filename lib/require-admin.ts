import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";

/** Retourne null si la requête est bien authentifiée admin, sinon une réponse 401 prête à renvoyer. */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  return null;
}
