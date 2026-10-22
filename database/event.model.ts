import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { normalizeDate, normalizeTime, slugify } from "@/lib/event-utils";

export interface IEvent {
  _id: string;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: string;
  updatedAt: string;
}

export type EventDocument = HydratedDocument<IEvent>;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isNonEmptyStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

// Indexes
eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ date: 1, time: 1 });

// Use pre("validate") to format, slugify, and validate before internal Mongoose validation fires
eventSchema.pre("validate", function () {
  // 1. Compute slug and format utility inputs if fields exist
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = slugify(this.title);
  }

  if (this.date && this.isModified("date")) {
    try {
      this.date = normalizeDate(this.date);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Validation error on date: ${message}`);
    }
  }

  if (this.time && this.isModified("time")) {
    try {
      this.time = normalizeTime(this.time);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Validation error on time: ${message}`);
    }
  }

  // 2. Comprehensive validation checks
  const invalidFields: string[] = [];

  if (!isNonEmptyString(this.title)) invalidFields.push("title");
  if (!isNonEmptyString(this.description)) invalidFields.push("description");
  if (!isNonEmptyString(this.overview)) invalidFields.push("overview");
  if (!isNonEmptyString(this.image)) invalidFields.push("image");
  if (!isNonEmptyString(this.venue)) invalidFields.push("venue");
  if (!isNonEmptyString(this.location)) invalidFields.push("location");
  if (!isNonEmptyString(this.date)) invalidFields.push("date");
  if (!isNonEmptyString(this.time)) invalidFields.push("time");
  if (!isNonEmptyString(this.mode)) invalidFields.push("mode");
  if (!isNonEmptyString(this.audience)) invalidFields.push("audience");
  if (!isNonEmptyString(this.organizer)) invalidFields.push("organizer");
  if (!isNonEmptyStringArray(this.agenda)) invalidFields.push("agenda");
  if (!isNonEmptyStringArray(this.tags)) invalidFields.push("tags");

  if (invalidFields.length > 0) {
    throw new Error(`Invalid required fields: ${invalidFields.join(", ")}`);
  }
});

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);
