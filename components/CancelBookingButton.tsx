"use client";
import { useTransition } from "react";
import { cancelBooking } from "@/lib/actions/booking.actions";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await cancelBooking(bookingId); })}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "Cancelling..." : "Cancel"}
    </button>
  );
}