"use server";

import { Event, IEvent } from "@/database/event.model";
import { connectToDatabase } from "../mongodb";

export const getSimilarEventsBySlug = async (
  slug: string,
): Promise<IEvent[]> => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: (event.tags as string[]) || [] },
    }).lean();

    return similarEvents.map((e) => ({
      ...(e as unknown as IEvent),
      _id: String(e._id),
      createdAt: e.createdAt ? String(e.createdAt) : "",
      updatedAt: e.updatedAt ? String(e.updatedAt) : "",
    }));
  } catch {
    return [];
  }
};
