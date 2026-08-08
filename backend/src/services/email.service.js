const nodemailer = require("nodemailer");

// Nodemailer's default connection timeout is ~2 minutes. On a host that cannot
// reach Gmail's SMTP port (many PaaS providers block outbound 465/587 to deter
// spam), the TCP connect simply hangs for that entire window before throwing —
// which surfaced to users as the signup form freezing for two minutes and then
// failing with "Email failed". Measured on Railway: 120s.
//
// These bounds make the same failure surface in seconds instead. They do NOT
// make email work where the network path is blocked; see
// mdfiles/mailchimp-email-integration.md for the real fix (an HTTPS email API
// rather than raw SMTP).
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 10000);

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS
});

async function sendOTP(
  email,
  otp
) {

  // Local development fallback: without email credentials, print the OTP
  // to the server console instead of failing the request.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [DEV] Email not configured — OTP for ${email}: ${otp}`);
    return;
  }

  try {

  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: email,

    subject: "OTP Verification",

    html: `
      <div>

      <h2>Verification Code</h2>

      <p>Your code:</p>

      <h1>${otp}</h1>

      <p>
      Valid for 5 minutes
      </p>

      </div>
    `
  });

  } catch (err) {

    // The caller turns any throw into a generic "Email failed" with no detail,
    // which made this impossible to diagnose in production. Log the actual
    // cause before rethrowing so the failure mode is identifiable from logs:
    //   ETIMEDOUT / ECONNECTION -> the host cannot reach Gmail's SMTP port
    //   EAUTH                   -> credentials rejected (Gmail needs an App Password)
    console.error(
      `[email] sendOTP to ${email} failed after ${SMTP_TIMEOUT_MS}ms budget:`,
      err && err.code ? `${err.code} — ${err.message}` : err
    );

    throw err;

  }

}

module.exports = {
  sendOTP
};