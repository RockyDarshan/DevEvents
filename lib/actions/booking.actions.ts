"use server";

import { Booking } from "@/database/booking.model";
import { connectToDatabase } from "@/lib/mongodb";

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
  slug: string;
}) => {
  try {
    await connectToDatabase();
    await Booking.create({ eventId, email });

    return { success: true };
  } catch (e) {
    console.error("Error creating booking:", e);
    return { success: false };
  }
};
