"use server";

import connectToDatabase from "@/lib/mongodb";
import EventModel from "@/database/event.model";
import BookingModel from "@/database/booking.model";

export async function createBooking(slug: string, email: string) {
  try {
    await connectToDatabase();

    // Find event by slug
    const event = await EventModel.findOne({ slug });
    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Check if already booked
    const existingBooking = await BookingModel.findOne({
      eventId: event._id,
      email,
    });

    if (existingBooking) {
      return { success: true, alreadyBooked: true, email };
    }

    // Create booking
    await BookingModel.create({
      eventId: event._id,
      email,
    });

    return { success: true, email };
  } catch (error) {
    console.error("BOOKING ACTION ERROR:", error);
    return { success: false, error: "Failed to create booking" };
  }
}
