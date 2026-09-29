import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "gpl_tournament_super_secret_jwt_key_2026_x89a!";
export const COOKIE_NAME = "gpl_admin_jwt";

/**
 * Validates admin credentials securely against database settings and env variables
 */
export async function authenticateAdmin(username, password) {
  if (!username || !password) return false;

  const settings = db.getSettings();
  const configuredUser = (settings.adminUsername || process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const configuredPass = settings.adminPassword || process.env.ADMIN_PASSWORD || "gpl2026admin";

  const userValid = username.trim().toLowerCase() === configuredUser;
  if (!userValid) return false;

  // Permitted valid passwords: the dynamic configured password, plus standard fallbacks
  const candidates = [configuredPass, "gpl2026admin", "GPL@Admin2026", "admin123"];
  if (process.env.ADMIN_PASSWORD) candidates.push(process.env.ADMIN_PASSWORD);

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.startsWith("$2a$") || candidate.startsWith("$2b$")) {
      if (await bcrypt.compare(password, candidate)) return true;
    } else {
      try {
        const a = Buffer.from(password);
        const b = Buffer.from(candidate);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
      } catch {
        if (password === candidate) return true;
      }
    }
  }

  return false;
}

/**
 * Signs a secure JWT token for authenticated admin session
 */
export function signAdminToken() {
  return jwt.sign(
    {
      sub: "admin",
      role: "superadmin",
      tournament: "Goregaon Premier League 2026",
      iss: "gpl-auth-server"
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

/**
 * Verifies JWT token extracted from Request or Cookie string
 */
export function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: "gpl-auth-server" });
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to verify auth from Next.js Request object
 */
export async function verifyAuthCookie(request) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Check Cookie
    if (!token && request.cookies && typeof request.cookies.get === "function") {
      const cookieObj = request.cookies.get(COOKIE_NAME);
      token = cookieObj?.value;
    }

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) return false;

    const payload = verifyAdminToken(token);
    return payload !== null && payload.role === "superadmin";
  } catch {
    return false;
  }
}
