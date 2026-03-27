const nodemailer = require("nodemailer");
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";

// Create transporter lazily — returns null if SMTP is not configured
function getTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || "587", 10),
        secure: parseInt(SMTP_PORT || "587", 10) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

async function sendInviteEmail(toEmail, projectName, inviterName) {
    const transporter = getTransporter();
    if (!transporter) {
        console.log("[mailer] SMTP not configured — skipping invite email");
        return;
    }
    await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: toEmail,
        subject: `You've been invited to "${projectName}" on Nexus`,
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f4f5f7;border-radius:8px;">
        <h2 style="color:#172b4d;margin-bottom:8px;">You're invited! 🎉</h2>
        <p style="color:#5e6c84;"><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong> on Nexus.</p>
        <a href="${FRONTEND_URL}/projects"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0052cc;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Open Nexus
        </a>
        <p style="margin-top:24px;color:#a5adba;font-size:12px;">If you weren't expecting this invite, you can ignore this email.</p>
      </div>
    `,
    });
}

async function sendAssignmentEmail(toEmail, taskTitle, assignerName, projectName) {
    const transporter = getTransporter();
    if (!transporter) {
        console.log("[mailer] SMTP not configured — skipping assignment email");
        return;
    }
    await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: toEmail,
        subject: `Task assigned to you: "${taskTitle}"`,
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f4f5f7;border-radius:8px;">
        <h2 style="color:#172b4d;margin-bottom:8px;">New task assigned 📋</h2>
        <p style="color:#5e6c84;"><strong>${assignerName}</strong> assigned you the task <strong>"${taskTitle}"</strong> in project <strong>${projectName}</strong>.</p>
        <a href="${FRONTEND_URL}/projects"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0052cc;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          View Task
        </a>
        <p style="margin-top:24px;color:#a5adba;font-size:12px;">You received this email because you're a member of ${projectName} on Nexus.</p>
      </div>
    `,
    });
}

module.exports = { sendInviteEmail, sendAssignmentEmail };
