import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { type, title, message, link, userId } = await req.json();

    const validTypes = ["HOT_LEAD", "NEW_APPOINTMENT", "LEAD_INACTIVE", "SYSTEM"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ error: "title et message requis" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: { type, title, message, link, userId },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
