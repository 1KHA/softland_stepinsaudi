// ─────────────────────────────────────────────────────────────────────────────
// Outbound email.
//
// Exports a single function, `sendOTP(email, otp)`. The signature is deliberate:
// the three call sites in auth.routes.js (login, registration, password reset)
// must not need to know how mail is delivered.
//
// Transport is chosen at call time, in this order:
//
//   1. Mailchimp Transactional (Mandrill) — used when MAILCHIMP_API_KEY is set.
//      Sends over HTTPS, which is the whole point: Railway (like most PaaS
//      hosts) does not allow outbound SMTP, so the previous Gmail transport
//      hung for its full 120s connection timeout and then failed with
//      "Email failed". HTTPS is not blocked.
//
//   2. SMTP via nodemailer — used when MAILCHIMP_API_KEY is absent but
//      EMAIL_USER/EMAIL_PASS are set. This keeps local development working
//      exactly as before (verified: sends in ~2s from a laptop) and gives a
//      fallback if the Mandrill key is ever unset. It will NOT work on Railway.
//
//   3. Console — neither configured. Prints the OTP to the server log so local
//      development needs no credentials at all.
//
// See mdfiles/mailchimp-email-integration.md for the full analysis.
// ─────────────────────────────────────────────────────────────────────────────

const nodemailer = require("nodemailer");
const mailchimpTransactional = require("@mailchimp/mailchimp_transactional");

// Nodemailer's default connection timeout is ~2 minutes. Bound it so a blocked
// SMTP port surfaces in seconds rather than freezing the signup form.
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 10000);

const MAIL_FROM = process.env.MAIL_FROM || "no-reply@stepinsaudi.com";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "StepIn Saudi";

// Lazily built so the module can be required without credentials present
// (tests, scripts, and the console fallback path all rely on this).
let mandrillClient = null;
function getMandrill() {
  if (!mandrillClient) {
    mandrillClient = mailchimpTransactional(process.env.MAILCHIMP_API_KEY);
  }
  return mandrillClient;
}

let smtpTransport = null;
function getSmtp() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS
    });
  }
  return smtpTransport;
}

// Which transport would be used right now. Exported so /health and startup
// logging can report it — "why did no email arrive" is otherwise guesswork.
function activeProvider() {
  if (process.env.MAILCHIMP_API_KEY) return "mandrill";
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) return "smtp";
  return "console";
}

const OTP_SUBJECT = "Your StepIn verification code";

// Brand colours per brand/StepIn Brand Guidelines §02 (navy #2B3E8F, cyan
// #1DBAEA). Inline styles only — email clients strip <style> blocks.
function otpHtml(otp) {
  return `
  <div style="margin:0;padding:32px 16px;background:#F4F7FB;font-family:'IBM Plex Sans Arabic',Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #D8E4F5;">
      <div style="height:4px;background:linear-gradient(90deg,#2B3E8F 0%,#0D5DA6 18%,#1DBAEA 38%,#008A84 55%,#98C23E 72%,#E9A623 88%,#FACC0B 100%);"></div>
      <div style="padding:32px;">
        <div style="font-size:22px;font-weight:700;color:#2B3E8F;letter-spacing:-0.5px;">
          Step<span style="color:#1DBAEA;">in</span>
          <span style="font-size:9px;letter-spacing:4px;color:#808184;margin-left:8px;">SAUDI</span>
        </div>
        <h1 style="margin:24px 0 8px;font-size:20px;font-weight:700;color:#2B3E8F;">Verification code</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3B3E3B;">
          Use the code below to continue. It expires in 5 minutes.
        </p>
        <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2B3E8F;background:#F4F7FB;border:1px solid #D8E4F5;padding:18px;text-align:center;">
          ${otp}
        </div>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#808184;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>`;
}

function otpText(otp) {
  return `StepIn Saudi — verification code\n\nYour code: ${otp}\nIt expires in 5 minutes.\n\nIf you did not request this code, you can ignore this email.`;
}

async function sendViaMandrill(email, otp) {
  const response = await getMandrill().messages.send({
    message: {
      from_email: MAIL_FROM,
      from_name: MAIL_FROM_NAME,
      to: [{ email, type: "to" }],
      subject: OTP_SUBJECT,
      html: otpHtml(otp),
      text: otpText(otp),
      auto_text: false,
      track_opens: false,
      track_clicks: false
    }
  });

  // The SDK RESOLVES rather than throws on failure, so an error looks like
  // success unless the payload is inspected. Three shapes seen in practice:
  //
  //   a) AxiosError object — the HTTP call itself failed (401 bad key, 5xx).
  //      The useful Mandrill payload is buried at response.response.data,
  //      e.g. { status:'error', code:401, name:'Invalid_Key', message:'Invalid API key' }
  //   b) { status:'error', name, message } — API-level error
  //   c) [ { status:'sent'|'queued'|'rejected'|'invalid', reject_reason } ] — per recipient
  const apiError =
    (response && response.response && response.response.data) ||
    (response && response.status === "error" ? response : null);

  if (apiError && apiError.status === "error") {
    throw new Error(
      `Mandrill ${apiError.name || "error"}: ${apiError.message}` +
        (apiError.name === "Invalid_Key"
          ? " — check MAILCHIMP_API_KEY"
          : "")
    );
  }

  if (response && response.name === "AxiosError") {
    throw new Error(`Mandrill request failed: ${response.message}`);
  }

  const result = Array.isArray(response) ? response[0] : null;

  if (!result) {
    throw new Error(
      `Mandrill returned an unexpected response shape: ${JSON.stringify(response).slice(0, 200)}`
    );
  }

  if (result.status === "rejected" || result.status === "invalid") {
    throw new Error(
      `Mandrill ${result.status}${result.reject_reason ? `: ${result.reject_reason}` : ""}`
    );
  }

  return result;
}

async function sendViaSmtp(email, otp) {
  return getSmtp().sendMail({
    from: `"${MAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: OTP_SUBJECT,
    html: otpHtml(otp),
    text: otpText(otp)
  });
}

async function sendOTP(email, otp) {
  const provider = activeProvider();

  if (provider === "console") {
    console.log(`📧 [DEV] Email not configured — OTP for ${email}: ${otp}`);
    return;
  }

  try {

    if (provider === "mandrill") {
      const result = await sendViaMandrill(email, otp);
      console.log(
        `[email] OTP sent to ${email} via mandrill (status=${result.status})`
      );
      return;
    }

    await sendViaSmtp(email, otp);
    console.log(`[email] OTP sent to ${email} via smtp`);

  } catch (err) {

    // The callers collapse any throw into a generic "Email failed" with no
    // detail, which made this undiagnosable in production. Log the real cause:
    //   ETIMEDOUT / ECONNECTION -> host cannot reach the SMTP port (use Mandrill)
    //   EAUTH                   -> SMTP credentials rejected
    //   Mandrill error (Invalid_Key) -> bad or missing MAILCHIMP_API_KEY
    //   Mandrill rejected: unsigned -> sending domain not SPF/DKIM verified
    console.error(
      `[email] sendOTP to ${email} failed via ${provider}:`,
      err && err.code ? `${err.code} — ${err.message}` : (err && err.message) || err
    );

    throw err;

  }
}

module.exports = {
  sendOTP,
  activeProvider
};
