import nodemailer, { Transporter } from "nodemailer";

interface EventDetails {
  title: string;
  date: string;
  time: string;
  location: string;
}

interface MailData {
  email: string;
  name: string;
  eventDetails: EventDetails;
}

export async function sendConfirmationEmail({
  email,
  name,
  eventDetails
}: MailData): Promise<void> {
  console.log("📧 Sending confirmation email...");

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS environment variables");
    throw new Error("Email configuration is invalid");
  }

  let transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.verify().catch((err) => {
    console.error("❌ Email transporter verification failed:", err);
    throw new Error("Email transporter verification failed");
  });

  // Send formatted email
  try {
    const info = await transporter.sendMail({
      from: `"Dev Events" <${user}>`,
      to: email,
      subject: `Your Booking – ${eventDetails.title}`,
      html: `
        <h2>Booking Confirmed 🎉</h2>
        <p>Hi <strong>${name}</strong>,</p>

        <p>Your booking has been successfully submitted!</p>

        <h3>📅 Event Details</h3>
        <p><strong>Title:</strong> ${eventDetails.title}</p>
        <p><strong>Date:</strong> ${eventDetails.date}</p>
        <p><strong>Time:</strong> ${eventDetails.time}</p>
        <p><strong>Location:</strong> ${eventDetails.location}</p>

        <br />
        <p>We’re excited to have you join this event. get ready!.</p>
      `,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err: any) {
    console.error("❌ Failed to send confirmation email:", err);
    throw new Error(err.message || "Email sending failed");
  }
}
