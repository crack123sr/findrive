import dotenv from "dotenv";
dotenv.config();
import { resend } from "../config/resend.config.js";

const mailer_sender =
  process.env.RESEND_MAILER_SENDER || "onboarding@resend.dev";

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}) => {
  const recipients = Array.isArray(to) ? to : [to];
  const sandboxRecipient =
    process.env.RESEND_TEST_EMAIL || recipients[0] || "";

  const finalRecipients =
    process.env.NODE_ENV === "development" && sandboxRecipient
      ? [sandboxRecipient]
      : recipients;

  if (process.env.NODE_ENV === "development" && sandboxRecipient) {
    console.log(
      `Resend sandbox: sending report email to ${sandboxRecipient} instead of ${recipients.join(", ")}`
    );
  }

  return await resend.emails.send({
    from: mailer_sender,
    to: finalRecipients,
    text,
    subject,
    html,
  });
};
