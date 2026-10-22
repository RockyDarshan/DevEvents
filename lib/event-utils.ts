export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+\$/g, "");

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");

export const normalizeDate = (value: string): string => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date must be a valid date string.");
  }
  return parsedDate.toISOString().slice(0, 10);
};

export const normalizeTime = (value: string): string => {
  const trimmed = value.trim().toUpperCase();

  // Updated regex to optionally capture AM/PM
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\$/);

  if (!match) {
    throw new Error(
      "Event time must be in a valid format (e.g., HH:mm, HH:mm:ss, or hh:mm AM/PM).",
    );
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  const ampm = match[4];

  // Handle 12-hour AM/PM conversions
  if (ampm) {
    if (hours < 1 || hours > 12) {
      throw new Error("Hours must be between 1 and 12 for AM/PM formats.");
    }
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  // Validate ranges
  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw new Error("Event time contains out-of-range values.");
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
