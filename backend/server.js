require("dotenv").config();

const app =
require("./src/app");

const PORT = process.env.PORT || 3000;

const { activeProvider } = require("./src/services/email.service");
const objectStore = require("./src/lib/storage");

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

// Same reasoning for uploads: a container-disk deployment looks identical to a
// bucket-backed one until a redeploy silently destroys every document.
console.log(`🗄️  File storage: ${objectStore.describe()}`);

if (!objectStore.isS3Enabled()) {
  console.warn(
    "   ⚠️  Uploads are on the local filesystem. On Railway this is ephemeral — " +
    "set AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
  );
}

});