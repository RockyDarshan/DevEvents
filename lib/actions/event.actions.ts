"use server";

import { Event, IEvent } from "@/database/event.model";
import { connectToDatabase } from "../mongodb";
import { serializeEvent } from "@/lib/serialize"; // 1. Added import statement

export const getSimilarEventsBySlug = async (
  slug: string,
): Promise<IEvent[]> => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    // 2. Updated database query to add .limit(3)
    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: (event.tags as string[]) || [] },
    })
      .limit(3)
      .lean();

    // 3. Updated mapping logic to use serializeEvent
    return similarEvents.map(serializeEvent);
  } catch {
    return [];
  }
};
