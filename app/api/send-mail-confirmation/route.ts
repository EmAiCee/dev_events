import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/database/event.model";
import { sendConfirmationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    console.log("📩 Mail route hit!");

    const body = await request.json();
    const { email, name, eventId } = body;

    // Validate
    if (!email || !name || !eventId) {
      console.log("❌ Missing fields:", body);
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectToDatabase();

    // 🔵 SIMPLE FETCH → Find by slug only
    const event = await EventModel.findOne({ slug: eventId }).lean();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Extract event details
    const eventDetails = {
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
    };

    // Send email
    await sendConfirmationEmail({ email, name, eventDetails });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ Email error:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
