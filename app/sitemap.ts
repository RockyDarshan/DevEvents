import type { MetadataRoute } from "next";
import { Event } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await connectToDatabase();
  const events = await Event.find().select("slug updatedAt").lean();
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/events`, lastModified: new Date() },
    ...events.map((e) => ({
      url: `${base}/events/${e.slug}`,
      lastModified: new Date(e.updatedAt),
    })),
  ];
}
