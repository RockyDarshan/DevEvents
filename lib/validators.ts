import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  description: z.string().trim().min(10, "Description is too short").max(2000),
  overview: z.string().trim().min(3, "Overview is required").max(300),
  image: z
    .string()
    .trim()
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//.test(v),
      "Image must be a URL or a /path",
    ),
  venue: z.string().trim().min(2, "Venue is required"),
  location: z.string().trim().min(2, "Location is required"),
  date: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  time: z.string().trim().min(1, "Time is required"),
  mode: z.enum(["In-person", "Online", "Hybrid"]),
  audience: z.string().trim().min(2, "Audience is required"),
  organizer: z.string().trim().min(2, "Organizer is required"),
  tags: z.array(z.string().trim().min(1)).min(1, "Add at least one tag"),
  agenda: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one agenda item"),
});

export const formatZodError = (error: z.ZodError) =>
  error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
