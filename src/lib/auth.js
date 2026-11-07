import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "gpl_tournament_super_secret_jwt_key_2026_x89a!";
export const COOKIE_NAME = "gpl_admin_jwt";

/**
 * Validates admin credentials against env variables
 */
export async function authenticateAdmin(username, password) {
  if (!username || !password) return false;

  // 1. First priority: Environment variables (.env / .env.local / Vercel env)
  const envUser = (process.env.ADMIN_USERNAME || process.env.CONSOLE_USERNAME || "").trim();
  const envPass = (process.env.ADMIN_PASSWORD || process.env.CONSOLE_PASSWORD || "").trim();

  let configuredUser = envUser.toLowerCase();
  let configuredPass = envPass;

  // 2. Fallback to MongoDB only if env variables are not set
  if (!configuredUser || !configuredPass) {
    try {
      const { connectToDatabase, MongoSetting } = await import("@/lib/mongodb");
      await connectToDatabase();
      const doc = await MongoSetting.findOne({ key: "global_settings" }).lean();
      if (!configuredUser && doc?.value?.adminUsername) {
        configuredUser = String(doc.value.adminUsername).trim().toLowerCase();
      }
      if (!configuredPass && doc?.value?.adminPassword) {
        configuredPass = String(doc.value.adminPassword).trim();
      }
    } catch (e) {
      // fallback to defaults if DB is temporarily unreachable
    }
  }

  // 3. Fallbacks
  if (!configuredUser) configuredUser = "admin";
  if (!configuredPass) configuredPass = "GPL@AdminNew2026";

  const userValid = username.trim().toLowerCase() === configuredUser;
  if (!userValid) return false;

  const inputPass = String(password).trim();
  const targetPass = String(configuredPass).trim();

  if (inputPass === targetPass) return true;

  try {
    const a = Buffer.from(inputPass);
    const b = Buffer.from(targetPass);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  } catch {}

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
