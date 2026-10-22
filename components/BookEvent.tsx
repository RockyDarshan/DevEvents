"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { createBooking } from "@/lib/actions/booking.actions";

const messages = {
  unauthenticated: "Please sign in to book.",
  already_booked: "You have already booked this event.",
  failed: "Something went wrong. Please try again.",
} as const;

const BookEvent = ({
  eventId,
  slug,
  userEmail,
}: {
  eventId: string;
  slug: string;
  userEmail: string | null;
}) => {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!userEmail) {
    return (
      <p className="text-sm">
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Sign in</Link> to book your spot.
      </p>
    );
  }
  if (done) return <p className="text-sm">You are booked for this event.</p>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createBooking({ eventId, slug });
      if (result.success) {
        setDone(true);
        posthog.capture("event_booked", { eventId, slug });
      } else {
        setError(messages[result.error]);
        posthog.capture("event_booking_failed", { eventId, reason: result.error });
      }
    });
  };

  return (
    <div id="book-event">
      <form onSubmit={handleSubmit}>
        <p className="text-sm">Booking as {userEmail}</p>
        <button type="submit" disabled={pending}>
          {pending ? "Booking..." : "Book my spot"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default BookEvent;