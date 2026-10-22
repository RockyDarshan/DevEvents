import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/database";
import { signupSchema, formatZodError } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();
    const user = await User.create(parsed.data); // the model hook hashes the password
    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: { id: String(user._id), name: user.name, email: user.email },
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    if ((e as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
