import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    await connectDB();
    await Subscriber.updateOne(
      { email: parsed.data.email },
      { $set: { isActive: true, subscribedAt: new Date() } },
      { upsert: true },
    );
    return NextResponse.json({ data: { subscribed: true } });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
