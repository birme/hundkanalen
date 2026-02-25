import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'send.one.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
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
    from: `"Färila anno 1923" <${from}>`,
    to,
    replyTo: email,
    subject,
    text: lines.join('\n'),
  });
}
