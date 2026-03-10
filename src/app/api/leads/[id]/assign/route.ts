import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { assignedToId } = await req.json();

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { assignedToId: assignedToId || null },
    });

    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
