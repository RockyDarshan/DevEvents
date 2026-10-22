import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";
import { eventSchema, formatZodError } from "@/lib/validators";
import { slugify } from "@/lib/event-utils";
import { serializeEvent } from "@/lib/serialize";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );

  const body = await req.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", details: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();
    // slug is set here because Mongoose validates "required" before the pre-save hook runs
    const created = await Event.create({
      ...parsed.data,
      slug: slugify(parsed.data.title),
      createdBy: user.userId,
    });
    return NextResponse.json(
      { message: "Event created successfully.", slug: created.slug },
      { status: 201 },
    );
  } catch (e: unknown) {
    if ((e as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { message: "An event with this title already exists." },
        { status: 409 },
      );
    }
    console.error("POST /api/events failed", e);
    return NextResponse.json(
      { message: "Failed to create event." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ events: events.map(serializeEvent) });
  } catch (e) {
    console.error("GET /api/events failed", e);
    return NextResponse.json(
      { message: "Failed to fetch events." },
      { status: 500 },
    );
  }
}
