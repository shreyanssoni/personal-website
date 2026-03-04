import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";

function getExpectedToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD env var not set");
  // Simple hash: base64 of password + salt
  return Buffer.from(`microbits_admin:${password}`).toString("base64");
}

export function createAdminToken(): string {
  return getExpectedToken();
}

export function validateAdminToken(token: string): boolean {
  try {
    return token === getExpectedToken();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return validateAdminToken(token);
}

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return validateAdminToken(token);
}

export { COOKIE_NAME };
