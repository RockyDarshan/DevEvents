import { cacheLife, cacheTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { Booking } from "@/database/booking.model";
import type { IEvent } from "@/database/event.model";

// Older documents may have agenda/tags stored as stringified arrays,
// so normalise them into a clean string[] when reading.
const cleanText = (value: string): string =>
  value
    .replace(/[\[\]"']+/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStringArray(item));
  }
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((item) => normalizeStringArray(item));
    }
    if (typeof parsed === "string" && parsed.trim()) {
      return normalizeStringArray(parsed);
    }
  } catch {
    // not JSON, fall through to plain-text cleanup
  }

  const quoted = [...trimmed.matchAll(/"([^"]*)"?/g)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
  if (quoted.length > 0) return quoted;

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  return [cleanText(trimmed)].filter(Boolean);
};

// Cached read of every event. Creating an event calls
// revalidateTag("events", { expire: 0 }) so the home page updates at once.
export async function getEvents(): Promise<IEvent[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  await connectToDatabase();
  const events = await Event.find().sort({ createdAt: -1 }).lean();
  // Round-trip through JSON so ObjectIds and Dates become plain strings.
  return JSON.parse(JSON.stringify(events)) as IEvent[];
}

// Cached read of one event by slug.
export async function getEventBySlug(slug: string): Promise<IEvent | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  await connectToDatabase();
  const event = await Event.findOne({ slug }).lean();
  if (!event) return null;

  const plain = JSON.parse(JSON.stringify(event)) as IEvent;
  return {
    ...plain,
    agenda: normalizeStringArray(plain.agenda),
    tags: normalizeStringArray(plain.tags),
  };
}

// Deliberately NOT cached, so the number is always current.
export async function getBookingCount(eventId: string): Promise<number> {
  await connectToDatabase();
  return Booking.countDocuments({ eventId });
}
