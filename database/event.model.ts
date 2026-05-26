import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeDate = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date must be a valid date string.");
  }

  return parsedDate.toISOString().slice(0, 10);
};

const normalizeTime = (value: string): string => {
  const trimmed = value.trim().toUpperCase();
  const simple24Hour = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (simple24Hour) {
    const hours = Number(simple24Hour[1]);
    const minutes = Number(simple24Hour[2]);
    const seconds = Number(simple24Hour[3] ?? 0);

    if (hours > 23 || minutes > 59 || seconds > 59) {
      throw new Error(
        "Event time must be in a valid HH:mm or HH:mm:ss format.",
      );
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  const twelveHour = trimmed.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/,
  );

  if (!twelveHour) {
    throw new Error("Event time must be in a valid 12-hour or 24-hour format.");
  }

  const hours = Number(twelveHour[1]);
  const minutes = Number(twelveHour[2]);
  const seconds = Number(twelveHour[3] ?? 0);
  const meridiem = twelveHour[4];

  if (hours < 1 || hours > 12 || minutes > 59 || seconds > 59) {
    throw new Error("Event time must be in a valid 12-hour format.");
  }

  const normalizedHours =
    meridiem === "AM"
      ? hours === 12
        ? 0
        : hours
      : hours === 12
        ? 12
        : hours + 12;

  return `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

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
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

// Keep a unique slug and regenerate it only when the title changes.
eventSchema.pre("save", async function () {
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

  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
});

eventSchema.index({ slug: 1 }, { unique: true });

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);
