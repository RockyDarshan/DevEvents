import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json({
        message: "Invalid form data",
        error: e instanceof Error ? e.message : "Unknown error",
        status: 400,
      });
    }

    if (!event.slug && typeof event.title === "string") {
      event.slug = slugify(event.title);
    }

    const createdEvent = await Event.create(event);

    return NextResponse.json({
      message: "Event created successfully",
      event: createdEvent,
      status: 201,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      message: "Event creation failed",
      error: e instanceof Error ? e.message : "Unknown error",
      status: 500,
    });
  }
}
