import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type SessionUser = { userId: string; email: string; name: string };

export const SESSION_COOKIE = "token";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days, matches the JWT expiry
};

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
};

export function signSession(user: SessionUser): string {
  return jwt.sign(user, getSecret(), { expiresIn: "7d" });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as SessionUser;
  } catch {
    return null; // expired or tampered
  }
}
