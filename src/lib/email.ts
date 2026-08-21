import nodemailer from 'nodemailer';

function getSmtpPassword() {
  if (process.env.SMTP_PASS_B64) {
    return Buffer.from(process.env.SMTP_PASS_B64, 'base64').toString('utf8');
  }

  return process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
}

const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const senderName = 'Birmé & Claise';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'send.one.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: getSmtpPassword(),
  },
});

type ContactEmailParams = {
  name: string;
  email: string;
  checkin?: string | null;
  checkout?: string | null;
  guests?: number | null;
  message?: string | null;
};

type AdminPasswordResetEmailParams = {
  email: string;
  name: string;
  resetUrl: string;
  expiresMinutes: number;
};

type ContractorAccessEmailParams = {
  email: string;
  name: string;
  accessUrl: string;
  validFrom: Date;
  validUntil: Date;
};

function formatSwedishDateTime(value: Date) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(value);
}

export async function sendContactEmail(params: ContactEmailParams) {
  const { name, email, checkin, checkout, guests, message } = params;
  const to = process.env.CONTACT_EMAIL || 'hundkanalen@birme.se';
  const from = process.env.SMTP_USER || 'jonas@birme.se';

  const lines: string[] = [
    `New inquiry from ${name} (${email})`,
    '',
  ];

  if (checkin) lines.push(`Check-in: ${checkin}`);
  if (checkout) lines.push(`Check-out: ${checkout}`);
  if (guests) lines.push(`Guests: ${guests}`);
  if (checkin || checkout || guests) lines.push('');
  if (message) {
    lines.push('Message:');
    lines.push(message);
  }

  const subject = `Färila anno 1923 – Inquiry from ${name}`;

  await transporter.sendMail({
    from: `"${senderName}" <${from}>`,
    to,
    replyTo: email,
    subject,
    text: lines.join('\n'),
  });
}

export async function sendAdminPasswordResetEmail(params: AdminPasswordResetEmailParams) {
  const { email, name, resetUrl, expiresMinutes } = params;
  const from = process.env.SMTP_USER || 'jonas@birme.se';
  const subject = 'Reset your Färila anno 1923 admin password';
  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset your admin password for Färila anno 1923.',
    `Use this link within ${expiresMinutes} minutes:`,
    '',
    resetUrl,
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n');

  await transporter.sendMail({
    from: `"${senderName}" <${from}>`,
    to: email,
    subject,
    text,
  });
}

export async function sendContractorAccessEmail(params: ContractorAccessEmailParams) {
  const { email, name, accessUrl, validFrom, validUntil } = params;
  const from = process.env.SMTP_USER || 'jonas@birme.se';
  const subject = 'Tillträde till Hundkanalen 3, Färila';
  const text = [
    `Hej ${name},`,
    '',
    'Här kommer en personlig länk med instruktioner för tillträde till Hundkanalen 3, Färila.',
    '',
    `Länken är giltig från ${formatSwedishDateTime(validFrom)} till ${formatSwedishDateTime(validUntil)}.`,
    '',
    accessUrl,
    '',
    'På sidan finns instruktioner för hur du hittar nyckelboxen och vilken kod som gäller under den angivna tiden.',
    '',
    'Dela inte länken vidare. Om tiden inte stämmer, kontakta oss så skickar vi en ny länk.',
    '',
    'Vänliga hälsningar,',
    'Hundkanalen 3, Färila',
  ].join('\n');

  await transporter.sendMail({
    from: `"${senderName}" <${from}>`,
    to: email,
    subject,
    text,
  });
}
