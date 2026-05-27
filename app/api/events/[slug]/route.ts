import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";
import type { IEvent } from "@/database/event.model";

const isValidSlug = (value: string | undefined): value is string => {
  if (!value) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

const cleanText = (value: string): string =>
  value
    .replace(/[\[\]"']+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeStringArray = (value: unknown): string[] => {
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
    // fall through to legacy string cleanup below
  }

  const quotedFragments = [...trimmed.matchAll(/"([^\"]*)"?/g)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);

  if (quotedFragments.length > 0) return quotedFragments;

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  return [cleanText(trimmed)].filter(Boolean);
};

// Serialize all ObjectId/Date fields to plain strings
const serializeEvent = (
  event: IEvent & { _id: unknown; createdAt?: unknown; updatedAt?: unknown },
) => ({
  ...event,
  _id: String(event._id),
  createdAt: event.createdAt ? String(event.createdAt) : undefined,
  updatedAt: event.updatedAt ? String(event.updatedAt) : undefined,
  agenda: normalizeStringArray(event.agenda),
  tags: normalizeStringArray(event.tags),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug?: string }> },
) {
  try {
    await connectToDatabase();

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { message: "Invalid or missing slug.", status: 400 },
        { status: 400 },
      );
    }

    const event = await Event.findOne({ slug }).lean<IEvent>();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found.", status: 404 },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully.",
        event: serializeEvent(
          event as IEvent & {
            _id: unknown;
            createdAt?: unknown;
            updatedAt?: unknown;
          },
        ),
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/events/[slug] failed", error);
    return NextResponse.json(
      {
        message: "Failed to fetch event.",
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      },
      { status: 500 },
    );
  }
}
