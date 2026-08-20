const nodemailer = require('nodemailer');

// Single shared transporter, reused across requests instead of
// creating a new connection per email.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== 'false', // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Fails loudly at boot if SMTP creds are wrong, instead of failing
// silently the first time someone submits the contact form.
transporter.verify((err) => {
  if (err) {
    console.error('Nodemailer transporter failed to verify:', err.message);
  } else {
    console.log('Nodemailer transporter ready');
  }
});

const sendContactNotification = async ({ name, email, message }) => {
  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    replyTo: email,
    subject: `New message from ${name}`,
    text: `You got a new contact form message.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>New message from your portfolio contact form</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `,
  });
};

// Minimal HTML escaping so a message can't inject markup into the
// notification email you read.
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendContactNotification };
