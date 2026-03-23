// server/lib/email.ts — Email service (SendGrid) with bilingual EN/FR templates
// Replaces raw Nodemailer SMTP. Falls back to console logging in dev.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@dealersuite360.com";
const FROM_NAME = process.env.FROM_NAME || "Dealer Suite 360";
const PLATFORM_URL = process.env.PLATFORM_URL || "https://dealersuite360.com";

async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from, replyTo } = options;

  if (!SENDGRID_API_KEY) {
    console.log(`[EMAIL-DEV] To: ${to}`);
    console.log(`[EMAIL-DEV] Subject: ${subject}`);
    console.log(`[EMAIL-DEV] Body preview: ${html.replace(/<[^>]*>/g, "").substring(0, 200)}...`);
    return true;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from || FROM_EMAIL, name: FROM_NAME },
        reply_to: replyTo ? { email: replyTo } : undefined,
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[EMAIL] SendGrid error (${response.status}):`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[EMAIL] Send failed:", error);
    return false;
  }
}

// ==================== SHARED TEMPLATE WRAPPER ====================

function wrapTemplate(content: string, lang: "en" | "fr" = "en"): string {
  const footer = lang === "fr"
    ? "Dealer Suite 360 · Propulsé par Dealer Suite 360"
    : "Dealer Suite 360 · Powered by Dealer Suite 360";

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:'Inter',-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <!-- Header -->
        <tr><td style="background:#08235d;padding:24px 32px">
          <span style="color:#fff;font-size:18px;font-weight:700">Dealer Suite 360</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px">${content}</td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e5e7eb;text-align:center">
          <span style="color:#888;font-size:12px">${footer}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:12px 28px;background:#08235d;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0">${text}</a>`;
}

// ==================== TRANSACTIONAL EMAILS ====================

export async function sendInvitationEmail(
  to: string,
  data: { firstName?: string; dealershipName: string; role: string; token: string; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, dealershipName, role, token, lang = "en" } = data;
  const url = `${PLATFORM_URL}/accept-invite?token=${token}`;

  const subject = lang === "fr"
    ? `Vous êtes invité à rejoindre ${dealershipName} sur Dealer Suite 360`
    : `You're invited to join ${dealershipName} on Dealer Suite 360`;

  const greeting = firstName
    ? (lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`)
    : (lang === "fr" ? "Bonjour," : "Hello,");

  const roleLabel = {
    dealer_owner: lang === "fr" ? "Propriétaire" : "Owner",
    dealer_staff: lang === "fr" ? "Personnel" : "Staff",
    customer: lang === "fr" ? "Client" : "Customer",
  }[role] || role;

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${greeting}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? `Vous avez été invité en tant que <strong>${roleLabel}</strong> chez <strong>${dealershipName}</strong> sur la plateforme Dealer Suite 360.`
        : `You've been invited as a <strong>${roleLabel}</strong> at <strong>${dealershipName}</strong> on the Dealer Suite 360 platform.`}
    </p>
    <div style="text-align:center">${btn(lang === "fr" ? "Accepter l'invitation" : "Accept Invitation", url)}</div>
    <p style="font-size:13px;color:#888;margin-top:24px">
      ${lang === "fr"
        ? "Ce lien expire dans 72 heures. Si vous n'avez pas demandé cette invitation, veuillez ignorer ce courriel."
        : "This link expires in 72 hours. If you didn't expect this invitation, please ignore this email."}
    </p>`;

  return sendEmail({ to, subject, html: wrapTemplate(content, lang) });
}

export async function sendPasswordResetEmail(
  to: string,
  data: { firstName: string; token: string; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, token, lang = "en" } = data;
  const url = `${PLATFORM_URL}/reset-password?token=${token}`;

  const subject = lang === "fr"
    ? "Réinitialisation de votre mot de passe — Dealer Suite 360"
    : "Reset your password — Dealer Suite 360";

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? "Nous avons reçu une demande de réinitialisation de votre mot de passe."
        : "We received a request to reset your password."}
    </p>
    <div style="text-align:center">${btn(lang === "fr" ? "Réinitialiser le mot de passe" : "Reset Password", url)}</div>
    <p style="font-size:13px;color:#888;margin-top:24px">
      ${lang === "fr"
        ? "Ce lien expire dans 60 minutes. Si vous n'avez pas fait cette demande, ignorez ce courriel."
        : "This link expires in 60 minutes. If you didn't request this, ignore this email."}
    </p>`;

  return sendEmail({ to, subject, html: wrapTemplate(content, lang) });
}

export async function sendClaimStatusEmail(
  to: string,
  data: { firstName: string; claimNumber: string; status: string; dealershipName?: string; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, claimNumber, status, lang = "en" } = data;
  const url = `${PLATFORM_URL}/dealer`;

  const statusLabels: Record<string, { en: string; fr: string }> = {
    submitted: { en: "Submitted", fr: "Soumise" },
    processing: { en: "Processing", fr: "En traitement" },
    authorized: { en: "Authorized", fr: "Autorisée" },
    denied: { en: "Denied", fr: "Refusée" },
    parts_ordered: { en: "Parts Ordered", fr: "Pièces commandées" },
    completed: { en: "Completed", fr: "Terminée" },
    paid: { en: "Paid", fr: "Payée" },
  };

  const label = statusLabels[status]?.[lang] || status;

  const subject = lang === "fr"
    ? `Réclamation ${claimNumber} — ${label}`
    : `Claim ${claimNumber} — ${label}`;

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? `Votre réclamation <strong>${claimNumber}</strong> a été mise à jour:`
        : `Your claim <strong>${claimNumber}</strong> has been updated:`}
    </p>
    <div style="text-align:center;margin:24px 0">
      <span style="display:inline-block;padding:8px 20px;background:#eff6ff;color:#08235d;border-radius:8px;font-size:16px;font-weight:600">${label}</span>
    </div>
    <div style="text-align:center">${btn(lang === "fr" ? "Voir la réclamation" : "View Claim", url)}</div>`;

  return sendEmail({ to, subject, html: wrapTemplate(content, lang) });
}

export async function sendInvoiceEmail(
  to: string,
  data: { firstName: string; invoiceNumber: string; total: string; currency: string; dueDate?: string; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, invoiceNumber, total, currency, dueDate, lang = "en" } = data;
  const url = `${PLATFORM_URL}/dealer`;

  const subject = lang === "fr"
    ? `Facture ${invoiceNumber} — ${total} ${currency}`
    : `Invoice ${invoiceNumber} — ${total} ${currency}`;

  const dueLine = dueDate
    ? `<p style="font-size:14px;color:#666">${lang === "fr" ? "Échéance:" : "Due:"} ${dueDate}</p>`
    : "";

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? `Une nouvelle facture a été émise pour votre concessionnaire.`
        : `A new invoice has been issued for your dealership.`}
    </p>
    <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
      <p style="font-size:13px;color:#888;margin:0">${lang === "fr" ? "Facture" : "Invoice"} #</p>
      <p style="font-size:20px;font-weight:700;color:#08235d;margin:4px 0">${invoiceNumber}</p>
      <p style="font-size:24px;font-weight:700;color:#111;margin:8px 0">$${total} ${currency}</p>
      ${dueLine}
    </div>
    <div style="text-align:center">${btn(lang === "fr" ? "Voir et payer" : "View & Pay", url)}</div>`;

  return sendEmail({ to, subject, html: wrapTemplate(content, lang) });
}

export async function sendTicketNotificationEmail(
  to: string,
  data: { firstName: string; ticketNumber: string; subject: string; message: string; isDealer: boolean; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, ticketNumber, subject: ticketSubject, message, isDealer, lang = "en" } = data;
  const url = isDealer ? `${PLATFORM_URL}/dealer` : `${PLATFORM_URL}/client`;

  const emailSubject = lang === "fr"
    ? `Nouveau message — Ticket ${ticketNumber}`
    : `New message — Ticket ${ticketNumber}`;

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? `Vous avez reçu un nouveau message sur le ticket <strong>${ticketNumber}</strong>:`
        : `You have a new message on ticket <strong>${ticketNumber}</strong>:`}
    </p>
    <div style="background:#fafafa;border-left:4px solid #08235d;padding:16px 20px;margin:16px 0;border-radius:0 8px 8px 0">
      <p style="font-size:13px;font-weight:600;color:#333;margin:0 0 8px">${ticketSubject}</p>
      <p style="font-size:14px;color:#555;margin:0;line-height:1.5">${message.substring(0, 300)}${message.length > 300 ? "..." : ""}</p>
    </div>
    <div style="text-align:center">${btn(lang === "fr" ? "Voir le ticket" : "View Ticket", url)}</div>`;

  return sendEmail({ to: to, subject: emailSubject, html: wrapTemplate(content, lang) });
}

export async function sendWelcomeEmail(
  to: string,
  data: { firstName: string; dealershipName: string; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, dealershipName, lang = "en" } = data;
  const url = `${PLATFORM_URL}/dealer`;

  const subject = lang === "fr"
    ? `Bienvenue chez Dealer Suite 360, ${firstName}!`
    : `Welcome to Dealer Suite 360, ${firstName}!`;

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? `Votre compte pour <strong>${dealershipName}</strong> est maintenant actif. Vous pouvez commencer à utiliser la plateforme immédiatement.`
        : `Your account for <strong>${dealershipName}</strong> is now active. You can start using the platform right away.`}
    </p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr" ? "Voici ce que vous pouvez faire:" : "Here's what you can do:"}
    </p>
    <ul style="font-size:14px;color:#555;line-height:2">
      <li>${lang === "fr" ? "Soumettre des réclamations de garantie" : "Submit warranty claims"}</li>
      <li>${lang === "fr" ? "Télécharger des photos et suivre les statuts" : "Upload photos and track claim statuses"}</li>
      <li>${lang === "fr" ? "Demander du financement et des services F&A" : "Request financing and F&I services"}</li>
      <li>${lang === "fr" ? "Commander des pièces" : "Order parts"}</li>
      <li>${lang === "fr" ? "Inviter vos clients à leur portail" : "Invite customers to their portal"}</li>
    </ul>
    <div style="text-align:center">${btn(lang === "fr" ? "Accéder au portail" : "Go to Portal", url)}</div>`;

  return sendEmail({ to, subject, html: wrapTemplate(content, lang) });
}

export async function sendWarrantyExpiryEmail(
  to: string,
  data: { firstName: string; vin: string; daysRemaining: number; lang?: "en" | "fr" }
): Promise<boolean> {
  const { firstName, vin, daysRemaining, lang = "en" } = data;

  const subject = lang === "fr"
    ? `Garantie expirante — VIN ${vin} (${daysRemaining} jours restants)`
    : `Warranty expiring — VIN ${vin} (${daysRemaining} days remaining)`;

  const content = `
    <p style="font-size:15px;color:#333;line-height:1.6">${lang === "fr" ? `Bonjour ${firstName},` : `Hi ${firstName},`}</p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? `La garantie du fabricant pour l'unité <strong>${vin}</strong> expire dans <strong>${daysRemaining} jours</strong>.`
        : `The manufacturer warranty for unit <strong>${vin}</strong> expires in <strong>${daysRemaining} days</strong>.`}
    </p>
    <p style="font-size:15px;color:#333;line-height:1.6">
      ${lang === "fr"
        ? "Soumettez toutes les réclamations en suspens avant l'expiration pour maximiser votre couverture."
        : "Submit any pending claims before expiry to maximize your coverage."}
    </p>`;

  return sendEmail({ to, subject, html: wrapTemplate(content, lang) });
}
