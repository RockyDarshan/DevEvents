import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { Booking } from "@/database/booking.model";
import { getCurrentUser } from "@/lib/auth";
import { eventSchema, formatZodError } from "@/lib/validators"; // created in Step 4
import { serializeEvent } from "@/lib/serialize";

type Ctx = { params: Promise<{ slug: string }> };

async function loadOwnedEvent(slug: string) {
  const user = await getCurrentUser();
  if (!user)
    return {
      error: NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      ),
    };

  await connectToDatabase();
  const event = await Event.findOne({ slug });
  if (!event)
    return {
      error: NextResponse.json(
        { message: "Event not found." },
        { status: 404 },
      ),
    };

  if (!event.createdBy || String(event.createdBy) !== user.userId) {
    return {
      error: NextResponse.json(
        { message: "You can only change your own events." },
        { status: 403 },
      ),
    };
  }
  return { event };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  await connectToDatabase();
  const event = await Event.findOne({ slug }).lean();
  if (!event)
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  return NextResponse.json({ event: serializeEvent(event) });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const result = await loadOwnedEvent(slug);
  if ("error" in result) return result.error;

  const body = await req.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", details: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    result.event.set(parsed.data); // only validated fields: no mass assignment of createdBy or slug
    await result.event.save(); // runs the model hooks (slug, date and time normalization)
    return NextResponse.json({
      message: "Event updated.",
      slug: result.event.slug,
    });
  } catch (e: unknown) {
    if ((e as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { message: "An event with this title already exists." },
        { status: 409 },
      );
    }
    console.error("PUT /api/events/[slug] failed", e);
    return NextResponse.json(
      { message: "Failed to update event." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const result = await loadOwnedEvent(slug);
  if ("error" in result) return result.error;

  await Booking.deleteMany({ eventId: result.event._id });
  await result.event.deleteOne();
  return NextResponse.json({ message: "Event deleted." });
}
