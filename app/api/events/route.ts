import { connectToDatabase } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { Event } from "@/database/event.model";
import { NextRequest, NextResponse } from "next/server";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeArrayItems = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.flatMap((item) => normalizeArrayItems(item));
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed))
      return parsed.flatMap((item) => normalizeArrayItems(item));
    if (typeof parsed === "string" && parsed.trim())
      return normalizeArrayItems(parsed);
  } catch {
    const quotedFragments = trimmed.match(/"([^"]+)"/g);
    if (quotedFragments?.length)
      return quotedFragments.map((f) => f.replace(/^"|"$/g, ""));
  }
  return [trimmed.replace(/^['"]+|['"]+$/g, "")];
};

const parseArrayField = (value: string): string[] => {
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed))
      return parsed.flatMap((item) => normalizeArrayItems(item));
    if (typeof parsed === "string") {
      const normalized = parsed.trim();
      if (!normalized) return [];
      if (normalized.includes(",")) {
        return normalized
          .split(",")
          .map((item) => item.trim().replace(/^['"]+|['"]+$/g, ""))
          .filter(Boolean);
      }
      return normalizeArrayItems(normalized);
    }
  } catch {
    /* fall through */
  }
  const normalizedItems = normalizeArrayItems(trimmed);
  if (normalizedItems.length > 1) return normalizedItems;
  return trimmed
    .split(",")
    .map((item) => item.trim().replace(/^['"]+|['"]+$/g, ""))
    .filter(Boolean);
};

const getFileFromFormData = (formData: FormData): File | null => {
  for (const key of ["image", "file", "upload"]) {
    const value = formData.get(key);
    if (value instanceof File) return value;
  }
  return null;
};

const parseFormData = async (req: NextRequest) => {
  const formData = await req.formData();
  const event: Record<string, unknown> = {};
  const file = getFileFromFormData(formData);

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    if (key === "agenda" || key === "tags") {
      event[key] = parseArrayField(value);
      continue;
    }
    if (key === "image" && typeof value === "string" && value.trim()) {
      event.image = value;
      continue;
    }
    event[key] = value;
  }

  return { event, file };
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const contentType = req.headers.get("content-type") ?? "";
    let event: Record<string, unknown>;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      try {
        ({ event, file } = await parseFormData(req));
      } catch (e) {
        return NextResponse.json(
          {
            message: "Failed to parse body as FormData.",
            error: e instanceof Error ? e.message : "Unknown error",
            status: 400,
          },
          { status: 400 },
        );
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json(
          { message: "Request body must be a JSON object.", status: 400 },
          { status: 400 },
        );
      }
      event = body as Record<string, unknown>;
    } else {
      return NextResponse.json(
        { message: "Unsupported content type.", status: 415 },
        { status: 415 },
      );
    }

    if (!event.slug && typeof event.title === "string")
      event.slug = slugify(event.title);

    if (!file) {
      if (typeof event.image !== "string" || event.image.trim().length === 0) {
        return NextResponse.json(
          { message: "Image is required.", status: 400 },
          { status: 400 },
        );
      }
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "image", folder: "events" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string });
              },
            )
            .end(buffer);
        },
      );
      event.image = uploadResult.secure_url;
    }

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      {
        message: "Event created successfully.",
        event: createdEvent,
        status: 201,
      },
      { status: 201 },
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: "Event creation failed.",
        error: e instanceof Error ? e.message : "Unknown error",
        status: 500,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const rawEvents = await Event.find().sort({ createdAt: -1 }).lean();

    // Serialize ObjectId and Date fields to plain strings
    const events = rawEvents.map((e) => ({
      ...e,
      _id: String(e._id),
      createdAt: e.createdAt ? String(e.createdAt) : "",
      updatedAt: e.updatedAt ? String(e.updatedAt) : "",
    }));

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
