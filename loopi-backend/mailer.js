const { Resend } = require("resend");
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

function getResend() {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
}

async function sendInviteEmail(toEmail, projectName, inviterName) {
    const resend = getResend();
    if (!resend) {
        console.log("[mailer] RESEND_API_KEY not configured — skipping invite email");
        return;
    }
    await resend.emails.send({
        from: `Nexus <${FROM_EMAIL}>`,
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
    const resend = getResend();
    if (!resend) {
        console.log("[mailer] RESEND_API_KEY not configured — skipping assignment email");
        return;
    }
    await resend.emails.send({
        from: `Nexus <${FROM_EMAIL}>`,
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
