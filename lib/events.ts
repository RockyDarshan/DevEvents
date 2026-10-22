import { Event } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeEvent } from "@/lib/serialize";

export async function getFeaturedEvents(limit = 6) {
  await connectToDatabase();
  const today = new Date().toISOString().slice(0, 10);
  let rows = await Event.find({ date: { $gte: today } })
    .sort({ date: 1, time: 1 })
    .limit(limit)
    .lean();
  if (rows.length === 0)
    rows = await Event.find().sort({ createdAt: -1 }).limit(limit).lean();
  return rows.map(serializeEvent);
}
