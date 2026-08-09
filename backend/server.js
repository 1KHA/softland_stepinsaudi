require("dotenv").config();

const app =
require("./src/app");

const PORT = process.env.PORT || 3000;

const { activeProvider } = require("./src/services/email.service");

app.listen(
PORT,
() => {
console.log(
`🚀 Server running on port ${PORT}`
);

// Which email transport is live. Without this, a misconfigured deployment
// looks identical to a working one until a user fails to receive an OTP.
const provider = activeProvider();

console.log(`📧 Email transport: ${provider}`);

if (provider === "smtp") {
  console.warn(
    "   ⚠️  SMTP will NOT work on hosts that block outbound mail ports " +
    "(Railway, most PaaS). Set MAILCHIMP_API_KEY in production."
  );
}

if (provider === "console") {
  console.warn(
    "   ⚠️  No email provider configured — OTPs are printed to this log only."
  );
}

});