import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { db } from "./db.js";

const LOGS_FILE = path.join(process.cwd(), "data", "email_logs.json");

function logEmailDispatch(entry) {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
    }
    logs.unshift({
      id: `EML-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    });
    // Keep last 100 email logs
    if (logs.length > 100) logs = logs.slice(0, 100);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write email log:", e);
  }
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD;

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      }),
      fromEmail: process.env.SMTP_FROM || user
    };
  }

  if (process.env.GMAIL_USER && (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD)) {
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD
        }
      }),
      fromEmail: process.env.GMAIL_USER
    };
  }

  return null;
}

export function getAdminContactEmail() {
  const settings = db.getSettings();
  return (
    settings.adminEmail ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.GMAIL_USER ||
    "goregaonpremierleague@gmail.com"
  );
}

export async function sendRegistrationNotificationEmail(player) {
  try {
    const adminEmail = getAdminContactEmail();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #081a36; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 4px; font-size: 22px; }
          .header p { margin: 0; color: #94a3b8; font-size: 13px; }
          .badge { display: inline-block; background: #0041b9; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 12px; }
          .body { padding: 24px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .label { font-weight: bold; color: #64748b; width: 38%; }
          .value { color: #0f172a; font-weight: 500; }
          .utr-box { background: #edf7ee; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin-top: 20px; text-align: center; }
          .utr-title { font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase; }
          .utr-code { font-size: 18px; font-family: monospace; font-weight: bold; color: #15803d; margin-top: 4px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>New Player Registration Received!</h1>
            <p>Radhe Radhe Chashak Goregaon Premier League</p>
            <div class="badge">${player.id}</div>
          </div>
          <div class="body">
            <table class="table">
              <tr>
                <td class="label">Player Name:</td>
                <td class="value"><strong>${player.name}</strong></td>
              </tr>
              <tr>
                <td class="label">Mobile Phone:</td>
                <td class="value"><a href="tel:${player.phone}">${player.phone}</a></td>
              </tr>
              <tr>
                <td class="label">Email Address:</td>
                <td class="value">${player.email || "N/A"}</td>
              </tr>
              <tr>
                <td class="label">Date of Birth:</td>
                <td class="value">${player.dob || "N/A"}</td>
              </tr>
              <tr>
                <td class="label">Ward:</td>
                <td class="value">${player.ward || "Ward 51"}</td>
              </tr>
              <tr>
                <td class="label">Playing Speciality:</td>
                <td class="value">${player.speciality}</td>
              </tr>
              <tr>
                <td class="label">T-Shirt Size:</td>
                <td class="value">${player.tshirtSize}</td>
              </tr>
              <tr>
                <td class="label">Track Pant Size:</td>
                <td class="value">${player.trackSize}</td>
              </tr>
              <tr>
                <td class="label">Registration Time:</td>
                <td class="value">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            </table>

            <div class="utr-box">
              <div class="utr-title">Payment Transaction / UTR Number</div>
              <div class="utr-code">${player.utrNumber || "N/A"}</div>
            </div>
          </div>
          <div class="footer">
            GPL Tournament Admin System • Access dashboard to approve/reject player documents.
          </div>
        </div>
      </body>
      </html>
    `;

    const transportInfo = getTransporter();
    if (transportInfo) {
      await transportInfo.transporter.sendMail({
        from: `"GPL Alert" <${transportInfo.fromEmail}>`,
        to: adminEmail,
        replyTo: adminEmail,
        subject: `🏏 New Player Registration: ${player.name} (${player.id}) - UTR: ${player.utrNumber || "N/A"}`,
        html: htmlContent
      });
      logEmailDispatch({ type: "ADMIN_NOTIFICATION", recipient: adminEmail, playerId: player.id, status: "SENT" });
      console.log(`[EMAIL] Registration alert successfully sent to admin ${adminEmail} for ${player.id}`);
    } else {
      logEmailDispatch({ type: "ADMIN_NOTIFICATION", recipient: adminEmail, playerId: player.id, status: "RECORDED_NO_SMTP" });
      console.log(`[EMAIL NOTICE] SMTP credentials not set in .env. Admin alert prepared for ${adminEmail} (Player: ${player.id}, Name: ${player.name})`);
    }
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send admin email notification:", error);
    logEmailDispatch({ type: "ADMIN_NOTIFICATION", playerId: player?.id, status: "ERROR", error: error.message });
  }
}

export async function sendPlayerStatusEmail(player, status, notes = "") {
  try {
    const isApproved = status.toLowerCase() === "approved";
    const isRejected = status.toLowerCase() === "rejected";

    if (!isApproved && !isRejected) return { sent: false, reason: "Status is neither Approved nor Rejected" };

    const playerEmail = player.email?.trim();
    if (!playerEmail || !playerEmail.includes("@") || playerEmail.endsWith("@gplcricket.local")) {
      console.log(`[EMAIL NOTICE] Player ${player.id} has no valid submitted email address (${playerEmail}). Skipping status email.`);
      logEmailDispatch({ type: "PLAYER_STATUS", recipient: playerEmail || "none", playerId: player.id, status: "SKIPPED_INVALID_EMAIL" });
      return { sent: false, reason: "Invalid or dummy email" };
    }

    const adminEmail = getAdminContactEmail();

    const subject = isApproved
      ? `🎉 Registration Approved! Welcome to Goregaon Premier League - Radhe Radhe Chashak (${player.id})`
      : `Update on your GPL Player Application - Radhe Radhe Chashak (${player.id})`;

    const statusBadgeColor = isApproved ? "#16a34a" : "#dc2626";
    const statusBg = isApproved ? "#f0fdf4" : "#fef2f2";
    const statusBorder = isApproved ? "#bbf7d0" : "#fecaca";
    const statusTitle = isApproved ? "REGISTRATION APPROVED" : "APPLICATION REJECTED";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }
          .header { background: #081a36; padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: -0.5px; }
          .header p { margin: 0; color: #cbd5e1; font-size: 14px; }
          .status-banner { margin: 24px; padding: 18px; border-radius: 10px; background: ${statusBg}; border: 1.5px solid ${statusBorder}; text-align: center; }
          .status-badge { display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: 1px; color: ${statusBadgeColor}; text-transform: uppercase; }
          .status-text { margin: 8px 0 0; font-size: 15px; font-weight: 600; color: #0f172a; }
          .body { padding: 0 24px 24px; }
          .info-card { background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 18px; margin-top: 18px; }
          .table { width: 100%; border-collapse: collapse; }
          .table td { padding: 9px 12px; font-size: 14px; border-bottom: 1px solid #edf2f7; }
          .table tr:last-child td { border-bottom: none; }
          .label { font-weight: 600; color: #64748b; width: 40%; }
          .value { color: #0f172a; font-weight: 500; }
          .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-top: 18px; font-size: 13px; color: #92400e; }
          .notes-title { font-weight: 700; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .action-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-top: 20px; text-align: center; font-size: 13px; color: #1e40af; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Goregaon Premier League</h1>
            <p>Radhe Radhe Chashak • Season 2026-2027</p>
          </div>

          <div class="status-banner">
            <div class="status-badge">${statusTitle}</div>
            <p class="status-text">
              ${
                isApproved
                  ? "Congratulations! Your registration documents & payment have been verified."
                  : "Your registration application could not be verified."
              }
            </p>
          </div>

          <div class="body">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              Dear <strong>${player.name}</strong>,
            </p>

            ${
              isApproved
                ? `<p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                    We are pleased to inform you that your application for the <strong>Goregaon Premier League (Radhe Radhe Chashak)</strong> has been formally <strong>APPROVED</strong>. You are now officially enrolled in the player pool for the upcoming Grand Auction!
                   </p>`
                : `<p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                    Thank you for applying for the <strong>Goregaon Premier League (Radhe Radhe Chashak)</strong>. Following the review of your submitted credentials, your application was not approved by the tournament organizing committee.
                   </p>`
            }

            <div class="info-card">
              <div style="font-size: 12px; font-weight: 700; color: #0041b9; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
                Registration Summary
              </div>
              <table class="table">
                <tr>
                  <td class="label">Player ID:</td>
                  <td class="value"><strong>${player.id}</strong></td>
                </tr>
                <tr>
                  <td class="label">Player Name:</td>
                  <td class="value">${player.name}</td>
                </tr>
                <tr>
                  <td class="label">Ward:</td>
                  <td class="value">${player.ward || "Ward 51"}</td>
                </tr>
                <tr>
                  <td class="label">Playing Role:</td>
                  <td class="value">${player.speciality}</td>
                </tr>
                <tr>
                  <td class="label">Kit Sizes:</td>
                  <td class="value">T-Shirt: ${player.tshirtSize} • Track: ${player.trackSize}</td>
                </tr>
                <tr>
                  <td class="label">Payment UTR:</td>
                  <td class="value"><code>${player.utrNumber || "Verified"}</code></td>
                </tr>
              </table>
            </div>

            ${
              notes
                ? `<div class="notes-box">
                    <div class="notes-title">Admin Remarks / Notes:</div>
                    <div>${notes}</div>
                  </div>`
                : ""
            }

            ${
              isApproved
                ? `<div class="action-box">
                    <strong>📅 Important Tournament Schedule:</strong><br />
                    • <strong>Mega Player Auction:</strong> December 2026<br />
                    • <strong>Tournament Match Dates:</strong> January 2027<br />
                    • <strong>Venue:</strong> Sambhaji Maidan, Goregaon East, Mumbai
                  </div>`
                : `<div class="action-box" style="background: #fff1f2; border-color: #fecdd3; color: #9f1239;">
                    <strong>Need Help or Clarification?</strong><br />
                    If you believe your documents (Aadhaar Ward 51/54 or Payment UTR) were submitted incorrectly, please contact the GPL tournament organizers at <a href="mailto:${adminEmail}">${adminEmail}</a>.
                  </div>`
            }
          </div>

          <div class="footer">
            <strong>Goregaon Premier League • Radhe Radhe Chashak</strong><br />
            Organised by: Mohsin Patel &amp; Balram Gupta (Ballu)<br />
            Official Admin Contact: <a href="mailto:${adminEmail}">${adminEmail}</a><br />
            This is an automated tournament status dispatch.
          </div>
        </div>
      </body>
      </html>
    `;

    const transportInfo = getTransporter();
    if (transportInfo) {
      await transportInfo.transporter.sendMail({
        from: `"GPL Tournament Committee" <${adminEmail}>`,
        to: playerEmail,
        replyTo: adminEmail,
        subject: subject,
        html: htmlContent
      });
      logEmailDispatch({ type: "PLAYER_STATUS", recipient: playerEmail, playerId: player.id, status: "SENT", decision: status, from: adminEmail });
      console.log(`[EMAIL] Player status (${status}) email successfully sent to ${playerEmail} for ${player.id} from ${adminEmail}`);
      return { sent: true, recipient: playerEmail, method: "SMTP", from: adminEmail };
    } else {
      logEmailDispatch({ type: "PLAYER_STATUS", recipient: playerEmail, playerId: player.id, status: "RECORDED_NO_SMTP", decision: status, from: adminEmail });
      console.log(`[EMAIL NOTICE] SMTP credentials not set in .env. Player status notification prepared & logged for ${playerEmail} from ${adminEmail}:`, {
        playerId: player.id,
        name: player.name,
        status: status,
        notes: notes
      });
      return { sent: true, recipient: playerEmail, method: "LOGGED", from: adminEmail };
    }
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send player status email:", error);
    logEmailDispatch({ type: "PLAYER_STATUS", recipient: player?.email, playerId: player?.id, status: "ERROR", error: error.message });
    return { sent: false, error: error.message };
  }
}

export async function sendAdminPasswordResetOtp(otpCode, adminEmail) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }
          .header { background: #081a36; padding: 26px 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 4px; font-size: 22px; }
          .header p { margin: 0; color: #cbd5e1; font-size: 13px; }
          .body { padding: 24px; text-align: center; }
          .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 18px; margin: 20px 0; }
          .otp-title { font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
          .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0041b9; font-family: monospace; margin: 8px 0; }
          .expiry-note { font-size: 12px; color: #64748b; margin-top: 4px; }
          .warning { font-size: 12px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px; margin-top: 16px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>GPL Admin Console</h1>
            <p>Password Reset Verification Request</p>
          </div>
          <div class="body">
            <p style="font-size: 14px; color: #334155; margin: 0 0 16px;">
              A request was made to reset the administrator password for the Goregaon Premier League control console. Use the verification code below:
            </p>
            <div class="otp-box">
              <div class="otp-title">One-Time Verification Code (OTP)</div>
              <div class="otp-code">${otpCode}</div>
              <div class="expiry-note">This code is valid for <strong>10 minutes</strong></div>
            </div>
            <div class="warning">
              If you did not initiate this password reset, please ignore this email. Your existing credentials remain secure.
            </div>
          </div>
          <div class="footer">
            GPL Tournament Committee Security System • Automated dispatch to verified admin email.
          </div>
        </div>
      </body>
      </html>
    `;

    const transportInfo = getTransporter();
    if (transportInfo) {
      await transportInfo.transporter.sendMail({
        from: `"GPL Security" <${transportInfo.fromEmail}>`,
        to: adminEmail,
        replyTo: adminEmail,
        subject: `🔐 GPL Admin Password Reset OTP: ${otpCode}`,
        html: htmlContent
      });
      logEmailDispatch({ type: "ADMIN_PASSWORD_RESET_OTP", recipient: adminEmail, status: "SENT" });
      console.log(`[EMAIL] Password reset OTP sent to admin ${adminEmail}`);
      return { sent: true, recipient: adminEmail, method: "SMTP" };
    } else {
      logEmailDispatch({ type: "ADMIN_PASSWORD_RESET_OTP", recipient: adminEmail, status: "RECORDED_NO_SMTP", otp: otpCode });
      console.log(`[EMAIL NOTICE] SMTP credentials not set in .env. Password reset OTP prepared for admin ${adminEmail}: [OTP: ${otpCode}]`);
      return { sent: true, recipient: adminEmail, method: "LOGGED", otp: otpCode };
    }
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send password reset OTP:", error);
    logEmailDispatch({ type: "ADMIN_PASSWORD_RESET_OTP", recipient: adminEmail, status: "ERROR", error: error.message });
    return { sent: false, error: error.message };
  }
}
