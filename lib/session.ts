import "server-only";
import crypto from "node:crypto";

export const ADMIN_COOKIE = "eylow_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET manquant (voir .env.local.example).");
  }
  return secret;
}

/** Crée une valeur de cookie signée : "<expiration>.<signature>" */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

/** Vérifie la validité et la fraîcheur d'un token de session admin */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}

/** Comparaison en temps constant pour éviter le timing attack sur le mot de passe */
export function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
