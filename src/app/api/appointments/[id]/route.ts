import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}