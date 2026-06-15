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