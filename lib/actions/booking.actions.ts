"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { Booking } from "@/database/booking.model";
import { Event } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export type BookingResult =
  | { success: true }
  | { success: false; error: "unauthenticated" | "already_booked" | "failed" };

export const createBooking = async ({
  eventId,
  slug,
}: {
  eventId: string;
  slug: string;
}): Promise<BookingResult> => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "unauthenticated" };

  try {
    await connectToDatabase();
    await Booking.create({ eventId, userId: user.userId, email: user.email });
    revalidatePath(`/events/${slug}`);
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: number })?.code === 11000) {
      return { success: false, error: "already_booked" };
    }
    console.error("createBooking failed:", e);
    return { success: false, error: "failed" };
  }
};

export const getMyBookings = async () => {
  const user = await getCurrentUser();
  if (!user) return [];
  await connectToDatabase();

  const bookings = await Booking.find({ userId: user.userId })
    .sort({ createdAt: -1 })
    .lean();
  const events = await Event.find({
    _id: { $in: bookings.map((b) => String(b.eventId)) },
  })
    .select("title slug date time location")
    .lean();
  const byId = new Map(events.map((e) => [String(e._id), e]));

  return bookings.flatMap((b) => {
    const e = byId.get(String(b.eventId));
    return e
      ? [
          {
            bookingId: String(b._id),
            slug: e.slug,
            title: e.title,
            date: e.date,
            time: e.time,
            location: e.location,
          },
        ]
      : [];
  });
};

export const cancelBooking = async (bookingId: string) => {
  const user = await getCurrentUser();
  if (!user || !mongoose.isValidObjectId(bookingId)) return { success: false };
  await connectToDatabase();
  // filtering by userId means you can only cancel your own booking
  const res = await Booking.deleteOne({ _id: bookingId, userId: user.userId });
  revalidatePath("/profile");
  return { success: res.deletedCount === 1 };
};
