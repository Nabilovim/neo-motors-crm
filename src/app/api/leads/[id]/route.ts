import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}