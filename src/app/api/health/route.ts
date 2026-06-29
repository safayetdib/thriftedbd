import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ data: { status: "ok", db: "connected" } });
  } catch (err) {
    return NextResponse.json(
      { error: { message: "Database unavailable", code: "DB_UNAVAILABLE" } },
      { status: 500 },
    );
  }
}
