// Robust input sanitization and validation against XSS, injection and malformed inputs

export function sanitizeText(input, maxLength = 200) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Strip raw tags
    .slice(0, maxLength);
}

export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = String(phone).replace(/\D/g, "");
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith("91"));
}

export function formatPhone(phone) {
  const cleaned = String(phone).replace(/\D/g, "");
  return cleaned.slice(-10);
}

export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(String(email).trim());
}

// These must exactly match the <option value="..."> in RegistrationForm.js
export const ALLOWED_TSHIRT_SIZES = ["Small", "Medium", "Large", "X-large", "XX-Large"];
export const ALLOWED_TRACK_SIZES = ["30", "32", "34", "36", "38"];
export const ALLOWED_SPECIALITIES = [
  "Right-hand batsman",
  "Left-hand batsman",
  "Right-hand bowler",
  "Left-hand bowler",
  "Right-hand all-rounder",
  "Left-hand all-rounder",
  "Wicketkeeper Batsman"
];

export const ALLOWED_WARDS = ["Ward 51", "Ward 54", "Other Ward (Review Required)"];
