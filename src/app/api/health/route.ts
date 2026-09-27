import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbTest = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now;`;
    return NextResponse.json({
      status: "ok",
      app: "FitCouple",
      database: "connected",
      timestamp: dbTest[0]?.now ?? new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        app: "FitCouple",
        database: "disconnected",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
