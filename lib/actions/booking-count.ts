"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { BookingModel } from "@/database/booking.model";

export async function getBookingCount(eventId: string) {
  try {
    await connectToDatabase();

    const count = await BookingModel.countDocuments({ eventId });

    return count;
  } catch (error) {
    console.error("BOOKING COUNT ERROR:", error);
    return 0;
  }
}
