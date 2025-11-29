"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/database/event.model";
import { BookingModel } from "@/database/booking.model";

export async function createBooking(slug: string, email: string) {
  try {
    await connectToDatabase();

    // Find event by slug
    const event = await EventModel.findOne({ slug });
    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Atomically find or create booking
    const result = await BookingModel.findOneAndUpdate(
      { eventId: event._id, email },
      { $setOnInsert: { eventId: event._id, email } },
      { upsert: true, new: true, rawResult: true }
    );

    if (!result.lastErrorObject?.upsertedId) {
      return { success: true, alreadyBooked: true, email };
    }

    return { success: true, email };

    return { success: true, email };
  } catch (error) {
    console.error("BOOKING ACTION ERROR:", error);
    return { success: false, error: "Failed to create booking" };
  }
}
