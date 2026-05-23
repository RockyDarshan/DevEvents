import { connectToDatabase } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

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

    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({
        message: "Image file is required",
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "events",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result as { secure_url: string });
              }
            },
          )
          .end(buffer);
      },
    );

    event.image = uploadResult.secure_url;

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

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      message: "Events fetched successfully",
      events,
      status: 200,
    });
  } catch (e) {
    return NextResponse.json({
      message: "Failed to fetch events",
      error: e instanceof Error ? e.message : "Unknown error",
      status: 500,
    });
  }
}
