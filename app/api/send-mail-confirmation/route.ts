import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// 🔹 Debug log when file loads
console.log('🟢 send-mail-confirmation API loaded');

export async function POST(req: Request) {
  console.log('📩 Mail route hit!');

  try {
    const { email, name, eventId } = await req.json();

    if (!email || !name || !eventId) {
      console.warn('⚠️ Missing fields in request body');
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation for Event: ${eventId}`,
      text: `Hello ${name},\n\nThank you for booking the event "${eventId}". We look forward to seeing you!\n\n- DEVEVENTS Team`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('📨 Email sent:', info.response);

    return NextResponse.json({ success: true, info: info.response });
  } catch (error) {
    console.error('EMAIL ERROR:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
