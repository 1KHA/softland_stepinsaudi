const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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

}

module.exports = {
  sendOTP
};