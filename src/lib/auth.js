import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "gpl_tournament_super_secret_jwt_key_2026_x89a!";
export const COOKIE_NAME = "gpl_admin_jwt";

/**
 * Validates admin credentials against env variables
 */
export async function authenticateAdmin(username, password) {
  if (!username || !password) return false;

  let configuredUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  let configuredPass = process.env.ADMIN_PASSWORD || "GPL@AdminNew2026";

  // Check MongoDB for updated credentials if available
  try {
    const { connectToDatabase, MongoSetting } = await import("@/lib/mongodb");
    await connectToDatabase();
    const doc = await MongoSetting.findOne({ key: "global_settings" }).lean();
    if (doc?.value?.adminUsername) {
      configuredUser = String(doc.value.adminUsername).trim().toLowerCase();
    }
    if (doc?.value?.adminPassword) {
      configuredPass = String(doc.value.adminPassword);
    }
  } catch (e) {
    // fallback to env vars / defaults if DB is temporarily unreachable
  }

  const userValid = username.trim().toLowerCase() === configuredUser;
  if (!userValid) return false;

  // Check password
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(configuredPass);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  } catch {
    if (password === configuredPass) return true;
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
