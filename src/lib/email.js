import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
// removed db import for serverless reliability

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
    // Expected on read-only serverless filesystems
  }

  // Also record in MongoDB MongoAudit for serverless persistence
  try {
    import("@/lib/mongodb").then(async ({ connectToDatabase, MongoAudit }) => {
      await connectToDatabase();
      await MongoAudit.create({
        id: `EML-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: "EMAIL_DISPATCH",
        details: entry
      });
    }).catch(() => {});
  } catch (e) {}
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
        },
        connectionTimeout: 15000,
        socketTimeout: 20000,
        greetingTimeout: 15000
      }),
      fromEmail: process.env.GMAIL_USER
    };
  }

  return null;
}

export function format4DigitId(id, regNumber) {
  if (typeof id === "number" || (/^\d{4}$/.test(id))) return String(id);
  if (/^\d{4}$/.test(regNumber)) return String(regNumber);
  const num = parseInt(regNumber, 10);
  if (!isNaN(num) && num > 0) return String(1000 + num);
  const digits = String(id || "").replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-4);
  return "1001";
}

export async function getAdminContactEmail(customEmail = null) {
  if (customEmail && typeof customEmail === "string" && customEmail.includes("@")) {
    return customEmail.trim();
  }
  try {
    const { connectToDatabase, MongoSetting } = await import("@/lib/mongodb");
    await connectToDatabase();
    const doc = await MongoSetting.findOne({ key: "global_settings" }).lean();
    if (doc?.value?.adminEmail && typeof doc.value.adminEmail === "string" && doc.value.adminEmail.includes("@")) {
      return doc.value.adminEmail.trim();
    }
  } catch (e) {}

  return (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.GMAIL_USER ||
    "goregaonpremierleague11@gmail.com"
  );
}

export async function sendRegistrationNotificationEmail(player, customAdminEmail = null) {
  try {
    const adminEmail = await getAdminContactEmail(customAdminEmail);
    const displayPlayerId = format4DigitId(player.id, player.regNumber);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0; }
          .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; color: #0f172a; }
          .header p { margin: 0; color: #64748b; font-size: 13px; }
          .badge { display: inline-block; background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-top: 12px; letter-spacing: 0.5px; }
          .body { padding: 24px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .label { font-weight: bold; color: #64748b; width: 38%; }
          .value { color: #0f172a; font-weight: 500; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>New Player Registration Received!</h1>
            <p>Radhe Radhe Chashak • Goregaon Premier League</p>
            <div class="badge">Player ID: ${displayPlayerId}</div>
          </div>
          <div class="body">
            <table class="table">
              <tr>
                <td class="label">Player ID:</td>
                <td class="value"><strong>${displayPlayerId}</strong></td>
              </tr>
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
        replyTo: "goregaonpremierleague11@gmail.com",
        subject: `🏏 New Registration: ${player.name} (Player ID: ${displayPlayerId})`,
        html: htmlContent
      });
      logEmailDispatch({ type: "ADMIN_NOTIFICATION", recipient: adminEmail, playerId: displayPlayerId, status: "SENT" });
      console.log(`[EMAIL] Registration alert successfully sent to admin ${adminEmail} for Player ID ${displayPlayerId}`);
      return { sent: true, recipient: adminEmail };
    } else {
      logEmailDispatch({ type: "ADMIN_NOTIFICATION", recipient: adminEmail, playerId: displayPlayerId, status: "RECORDED_NO_SMTP" });
      console.log(`[EMAIL NOTICE] SMTP credentials not set in .env. Admin alert prepared for ${adminEmail} (Player ID: ${displayPlayerId}, Name: ${player.name})`);
      return { sent: false, reason: "No SMTP" };
    }
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send admin email notification:", error);
    logEmailDispatch({ type: "ADMIN_NOTIFICATION", playerId: player?.id, status: "ERROR", error: error.message });
    return { sent: false, error: error.message };
  }
}

export async function sendPlayerRegistrationConfirmationEmail(player) {
  try {
    const playerEmail = player.email?.trim();
    if (!playerEmail || !playerEmail.includes("@") || playerEmail.endsWith("@gplcricket.local")) {
      console.log(`[EMAIL NOTICE] Player ${player.id} has no valid submitted email address (${playerEmail}). Skipping registration confirmation email.`);
      return { sent: false, reason: "No valid email" };
    }

    const displayPlayerId = format4DigitId(player.id, player.regNumber);
    const transportInfo = getTransporter();
    if (!transportInfo) {
      console.log(`[EMAIL NOTICE] SMTP credentials not set. Skipping player registration confirmation for ${playerEmail}`);
      return { sent: false, reason: "No SMTP" };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }
          .header { background: linear-gradient(135deg, #081a36 0%, #0041b9 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #ffffff; }
          .header p { margin: 0; color: #cbd5e1; font-size: 13px; }
          .badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 6px 18px; border-radius: 999px; font-size: 14px; font-weight: 900; margin-top: 16px; letter-spacing: 1px; }
          .body { padding: 28px 24px; }
          .intro { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 20px; }
          .status-banner { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: center; }
          .status-banner .title { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
          .status-banner .status { color: #1d4ed8; font-size: 15px; font-weight: 800; }
          .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .label { font-weight: 700; color: #64748b; width: 40%; }
          .value { color: #0f172a; font-weight: 600; }
          .next-steps { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-top: 24px; }
          .next-steps h4 { margin: 0 0 8px; font-size: 14px; font-weight: 800; color: #166534; }
          .next-steps p { margin: 0; font-size: 12px; color: #15803d; line-height: 1.6; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Registration Received!</h1>
            <p>Goregaon Premier League • Radhe Radhe Chashak Season 4</p>
            <div class="badge">REG ID: #${displayPlayerId}</div>
          </div>
          <div class="body">
            <p class="intro">
              Hello <strong>${player.name}</strong>,<br/>
              Thank you for registering for the <strong>Goregaon Premier League (GPL 4)</strong>! Your registration application has been received and logged into our tournament system.
            </p>

            <div class="status-banner">
              <div class="title">Current Application Status</div>
              <div class="status">⏳ Verification Under Review (Pending)</div>
            </div>

            <table class="table">
              <tr>
                <td class="label">Registration ID:</td>
                <td class="value"><strong>#${displayPlayerId}</strong></td>
              </tr>
              <tr>
                <td class="label">Full Name:</td>
                <td class="value">${player.name}</td>
              </tr>
              <tr>
                <td class="label">Registered Phone:</td>
                <td class="value">${player.phone}</td>
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
                <td class="label">Submission Time:</td>
                <td class="value">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            </table>

            <div class="next-steps">
              <h4>What Happens Next?</h4>
              <p>
                1. The organizing committee will review your Aadhaar and Ward 51/54 residency criteria.<br/>
                2. Once your registration is <strong>Approved</strong>, you will receive an approval email with your official Player ID Card, and you will enter the <strong>Grand Player Auction Pool</strong>!<br/>
                3. You can also verify your live status anytime on the GPL website under <strong>"Check Status"</strong> using your phone number or Registration ID.
              </p>
            </div>
          </div>
          <div class="footer">
            Goregaon Premier League Season 4 • Sambhaji Maidan, Goregaon East, Mumbai<br/>
            Organised by Sandeep Jadhav (Founder of Radhe Radhe Foundation) • Event Managed by ROYAL STRIKER GROUP<br/>
            Official Admin Contact: <a href="mailto:goregaonpremierleague11@gmail.com">goregaonpremierleague11@gmail.com</a>
          </div>
        </div>
      </body>
      </html>
    `;

    await transportInfo.transporter.sendMail({
      from: `"GPL Cricket" <${transportInfo.fromEmail}>`,
      to: playerEmail,
      subject: `🏏 GPL Registration Received: ${player.name} (Reg #${displayPlayerId})`,
      html: htmlContent
    });

    logEmailDispatch({ type: "PLAYER_REGISTRATION_CONFIRMATION", recipient: playerEmail, playerId: displayPlayerId, status: "SENT" });
    console.log(`[EMAIL] Registration confirmation email successfully sent to player ${playerEmail} for ID ${displayPlayerId}`);
    return { sent: true, recipient: playerEmail };
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send player registration confirmation email:", error);
    logEmailDispatch({ type: "PLAYER_REGISTRATION_CONFIRMATION", playerId: player?.id, status: "ERROR", error: error.message });
    return { sent: false, error: error.message };
  }
}

export async function sendPlayerStatusEmail(player, status, notes = "", cardDataUrl = null) {
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

    const displayPlayerId = format4DigitId(player.id, player.regNumber);
    const adminEmail = (await getAdminContactEmail()) || "goregaonpremierleague11@gmail.com";

    // Subject without registration number as requested
    const subject = isApproved
      ? `🎉 Registration Approved! Welcome to Goregaon Premier League`
      : `Update on your GPL Player Application - Goregaon Premier League`;

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
          .header { background: #f8fafc; padding: 28px 24px; text-align: center; border-bottom: 1px solid #e2e8f0; }
          .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .header p { margin: 0; color: #64748b; font-size: 14px; }
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
          .rejection-box { background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 8px; padding: 16px; margin-top: 18px; font-size: 14px; color: #9f1239; line-height: 1.5; }
          .rejection-title { font-weight: 800; margin-bottom: 6px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: #be123c; }
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
                  ? "Congratulations! Your registration documents have been verified."
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
                    Thank you for applying for the <strong>Goregaon Premier League (Radhe Radhe Chashak)</strong>. Following the review of your submitted documents, your application was not approved by the tournament committee.
                   </p>`
            }

            <div class="info-card">
              <div style="font-size: 12px; font-weight: 700; color: #0041b9; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
                Player Details
              </div>
              <table class="table">
                <tr>
                  <td class="label">Player ID:</td>
                  <td class="value"><strong style="font-size: 16px; color: #0041b9; font-family: monospace;">${displayPlayerId}</strong></td>
                </tr>
                <tr>
                  <td class="label">Player Name:</td>
                  <td class="value"><strong>${player.name}</strong></td>
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
              </table>
            </div>

            ${
              isApproved
                ? `<div style="margin: 20px 0; text-align: center; background: #f8fafc; border-radius: 12px; padding: 18px; border: 1.5px solid #bbf7d0;">
                    <div style="font-size: 13px; font-weight: 800; color: #15803d; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
                      🎟️ Your Official Registered Player Card
                    </div>
                    <img
                      src="cid:registeredCardImage"
                      alt="GPL Official Player Registration Card"
                      style="max-width: 100%; width: 420px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); display: block; margin: 0 auto;"
                    />
                    <p style="font-size: 12px; color: #64748b; margin-top: 10px; margin-bottom: 0;">
                      (Your high-resolution official registered card is also attached to this email)
                    </p>
                  </div>`
                : ""
            }

            ${
              isRejected
                ? `<div class="rejection-box">
                    <div class="rejection-title">⚠️ Reason for Rejection:</div>
                    <div>${notes || "Document details or eligibility requirements could not be verified by the committee."}</div>
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
                    If you believe your documents were submitted incorrectly, please contact the GPL tournament organizers at <a href="mailto:goregaonpremierleague11@gmail.com">goregaonpremierleague11@gmail.com</a>.
                  </div>`
            }
          </div>

          <div class="footer">
            <strong>Goregaon Premier League • Radhe Radhe Chashak</strong><br />
            Organised by: Sandeep Jadhav (Founder of Radhe Radhe Foundation) • Event Managed by ROYAL STRIKER GROUP<br />
            Official Admin Contact: <a href="mailto:goregaonpremierleague11@gmail.com">goregaonpremierleague11@gmail.com</a><br />
            This is an automated tournament status dispatch.
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    const isPlayerApproved = String(player?.paymentStatus || "").toLowerCase() === "approved";
    if (isPlayerApproved) {
      const customCard = cardDataUrl || player?.cardUrl;
      if (customCard && typeof customCard === "string" && customCard.startsWith("data:image/")) {
        try {
          const base64Data = customCard.split(",")[1];
          if (base64Data) {
            attachments.push({
              filename: `GPL4_PlayerCard_${displayPlayerId}_REGISTERED.png`,
              content: Buffer.from(base64Data, "base64"),
              cid: "registeredCardImage"
            });
          }
        } catch (e) {
          console.warn("[Custom Card Buffer Error]:", e.message);
        }
      }

      if (attachments.length === 0) {
        const cardPath = path.join(process.cwd(), "public", "images", "template-player-card-approved.png");
        if (fs.existsSync(cardPath)) {
          attachments.push({
            filename: `GPL4_PlayerCard_${displayPlayerId}_REGISTERED.png`,
            path: cardPath,
            cid: "registeredCardImage"
          });
        }
      }
    }

    const transportInfo = getTransporter();
    if (transportInfo) {
      await transportInfo.transporter.sendMail({
        from: `"GPL Tournament Committee" <${transportInfo.fromEmail}>`,
        to: playerEmail,
        replyTo: "goregaonpremierleague11@gmail.com",
        subject: subject,
        html: htmlContent,
        attachments
      });
      logEmailDispatch({ type: "PLAYER_STATUS", recipient: playerEmail, playerId: displayPlayerId, status: "SENT", decision: status, from: adminEmail });
      console.log(`[EMAIL] Player status (${status}) email successfully sent to ${playerEmail} for Player ID ${displayPlayerId}`);
      return { sent: true, recipient: playerEmail, method: "SMTP", from: adminEmail };
    } else {
      logEmailDispatch({ type: "PLAYER_STATUS", recipient: playerEmail, playerId: displayPlayerId, status: "RECORDED_NO_SMTP", decision: status, from: adminEmail });
      return { sent: false, reason: "SMTP not configured" };
    }
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send player status email:", error);
    return { sent: false, error: error.message };
  }
}

export async function sendTeamAssignmentEmail(player, team, cardDataUrl = null) {
  try {
    const playerEmail = player?.email?.trim();
    if (!playerEmail || !playerEmail.includes("@") || playerEmail.endsWith("@gplcricket.local")) {
      console.log(`[EMAIL NOTICE] Player ${player?.id} has no valid submitted email (${playerEmail}). Skipping team draft email.`);
      return { sent: false, reason: "Invalid or dummy email" };
    }

    const displayPlayerId = format4DigitId(player.id, player.regNumber);
    const adminEmail = await getAdminContactEmail();
    const teamName = team?.name || "Official GPL Franchise";
    const teamOwner = team?.owner || "Franchise Owner";
    const teamCaptain = team?.captain || "To be drafted";
    const teamShortCode = team?.shortCode || "GPL";
    const soldPrice = Math.max(0, Number(player?.soldPrice) || 0);

    const subject = soldPrice > 0
      ? `🏏 Congratulations! Drafted to ${teamName} for ${soldPrice.toLocaleString("en-IN")} - GPL Auction`
      : `🏏 Congratulations! Drafted to ${teamName} - GPL Player Auction`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px 16px; color: #1e293b; }
          .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.08); }
          .header { background: #eff6ff; padding: 32px 24px; text-align: center; border-bottom: 2px solid #dbeafe; }
          .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px; }
          .header p { margin: 0; color: #2563eb; font-size: 13px; font-weight: 600; }
          .badge { display: inline-block; background: #dbeafe; color: #1e40af; border: 1.5px solid #bfdbfe; padding: 6px 18px; border-radius: 999px; font-size: 12px; font-weight: 900; margin-top: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .body { padding: 30px 24px; }
          .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 22px; }
          .team-banner { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 20px; }
          .team-code { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; font-family: monospace; text-transform: uppercase; margin-bottom: 6px; }
          .team-title { font-size: 25px; font-weight: 900; color: #081a36; margin: 4px 0 8px; }
          .team-leaders { font-size: 13px; color: #475569; line-height: 1.6; }
          .bid-box { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; border-radius: 14px; padding: 20px 24px; text-align: center; margin-bottom: 24px; box-shadow: 0 6px 16px -2px rgba(5, 150, 105, 0.3); }
          .bid-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.95; margin-bottom: 4px; }
          .bid-amount { font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 0.5px; line-height: 1.2; }
          .bid-sub { font-size: 12px; opacity: 0.95; margin-top: 6px; font-weight: 600; }
          .direct-pick-box { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 14px; padding: 16px 20px; text-align: center; margin-bottom: 24px; }
          .direct-pick-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #2563eb; margin-bottom: 2px; }
          .direct-pick-title { font-size: 17px; font-weight: 800; color: #1e3a8a; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .table tr:last-child td { border-bottom: none; }
          .label { font-weight: 700; color: #64748b; width: 38%; }
          .value { color: #0f172a; font-weight: 600; }
          .next-steps { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px; padding: 18px 22px; margin-top: 24px; }
          .next-steps h4 { margin: 0 0 10px; font-size: 14px; font-weight: 800; color: #166534; }
          .next-steps p { margin: 0; font-size: 12px; color: #15803d; line-height: 1.6; }
          .footer { background: #f8fafc; padding: 22px 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Goregaon Premier League</h1>
            <p>Radhe Radhe Chashak • Official Player Auction Result</p>
            <div class="badge">AUCTION SELECTION CONFIRMED</div>
          </div>

          <div class="body">
            <div class="greeting">
              Dear ${player.name},
            </div>

            <p class="intro">
              Congratulations! We are delighted to inform you that you have been officially selected and purchased in the <strong>Goregaon Premier League Season 4 Grand Player Auction</strong>!
            </p>

            ${
              soldPrice > 0
                ? `<div class="bid-box">
                    <div class="bid-label">🏆 Winning Auction Bid Amount</div>
                    <div class="bid-amount">${soldPrice.toLocaleString("en-IN")}</div>
                    <div class="bid-sub">Purchased by ${teamName}</div>
                  </div>`
                : `<div class="direct-pick-box">
                    <div class="direct-pick-label">🏆 Franchise Draft Selection</div>
                    <div class="direct-pick-title">Selected via Official Franchise Pick</div>
                  </div>`
            }

            <div class="team-banner">
              <span class="team-code">CODE: ${teamShortCode}</span>
              <div class="team-title">${teamName}</div>
              <div class="team-leaders">
                <strong>Franchise Owner:</strong> ${teamOwner} &bull; <strong>Captain:</strong> ${teamCaptain}
              </div>
            </div>

            <table class="table">
              <tr>
                <td class="label">Player ID:</td>
                <td class="value"><strong style="font-family: monospace; font-size: 15px; color: #0041b9;">#${displayPlayerId}</strong></td>
              </tr>
              <tr>
                <td class="label">Player Name:</td>
                <td class="value"><strong>${player.name}</strong></td>
              </tr>
              <tr>
                <td class="label">Playing Role:</td>
                <td class="value">${player.speciality}</td>
              </tr>
              <tr>
                <td class="label">Ward Constituency:</td>
                <td class="value">${player.ward || "Ward 51"}</td>
              </tr>
              <tr>
                <td class="label">Kit Sizes:</td>
                <td class="value">Jersey: ${player.tshirtSize} &bull; Track: ${player.trackSize}</td>
              </tr>
              <tr>
                <td class="label">Match Venue:</td>
                <td class="value">Sambhaji Maidan, Goregaon East, Mumbai</td>
              </tr>
            </table>

            <div class="next-steps">
              <h4>What's Next for You?</h4>
              <p>
                1. Your team management (${teamOwner}) will connect with you regarding practice matches and team strategy.<br />
                2. Your official customized team kit (${player.tshirtSize} Jersey / ${player.trackSize} Track Pant) will be handed to you prior to the opening ceremony.<br />
                3. Follow live league announcements and match schedules on the official GPL portal.
              </p>
            </div>

          </div>

          <div class="footer">
            <strong>Goregaon Premier League &bull; Radhe Radhe Chashak Season 4</strong><br />
            Organised with pride by Sandeep Jadhav (Founder of Radhe Radhe Foundation) • Event Managed by ROYAL STRIKER GROUP<br />
            Official Contact: <a href="mailto:goregaonpremierleague11@gmail.com" style="color: #0041b9; text-decoration: none;">goregaonpremierleague11@gmail.com</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    const isPlayerApproved = String(player?.paymentStatus || "").toLowerCase() === "approved";
    if (isPlayerApproved) {
      const customCard = cardDataUrl || player?.cardUrl;
      if (customCard && typeof customCard === "string" && customCard.startsWith("data:image/")) {
        try {
          const base64Data = customCard.split(",")[1];
          if (base64Data) {
            attachments.push({
              filename: `GPL4_PlayerCard_${displayPlayerId}_REGISTERED.png`,
              content: Buffer.from(base64Data, "base64"),
              cid: "registeredCardImage"
            });
          }
        } catch (e) {}
      }

      if (attachments.length === 0) {
        const cardPath = path.join(process.cwd(), "public", "images", "template-player-card-approved.png");
        if (fs.existsSync(cardPath)) {
          attachments.push({
            filename: `GPL4_PlayerCard_${displayPlayerId}_REGISTERED.png`,
            path: cardPath,
            cid: "registeredCardImage"
          });
        }
      }
    }

    const transportInfo = getTransporter();
    if (transportInfo) {
      await transportInfo.transporter.sendMail({
        from: `"GPL Tournament Committee" <${transportInfo.fromEmail}>`,
        to: playerEmail,
        replyTo: "goregaonpremierleague11@gmail.com",
        subject: subject,
        html: htmlContent,
        attachments
      });
      logEmailDispatch({ type: "TEAM_ASSIGNMENT", recipient: playerEmail, playerId: displayPlayerId, team: teamName, status: "SENT" });
      console.log(`[EMAIL] Team assignment email sent to ${playerEmail} for team ${teamName} (Sold Price: ${soldPrice})`);
      return { sent: true };
    } else {
      logEmailDispatch({ type: "TEAM_ASSIGNMENT", recipient: playerEmail, playerId: displayPlayerId, team: teamName, status: "RECORDED_NO_SMTP" });
      return { sent: false, reason: "SMTP not configured" };
    }
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send team assignment email:", error);
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
          .header { background: #f8fafc; padding: 26px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; }
          .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; color: #0f172a; }
          .header p { margin: 0; color: #64748b; font-size: 13px; }
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
        replyTo: "goregaonpremierleague11@gmail.com",
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
