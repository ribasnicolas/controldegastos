import { NextRequest, NextResponse } from "next/server";
import { generateDueRecurring } from "@/lib/actions/recurring";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await generateDueRecurring();
  return NextResponse.json({ ok: true, ...result });
}
