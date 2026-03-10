import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { conversation: true },
    });
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { updates } = await req.json();
    // updates: Array<{ id: string; status: string }>
    const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    const results = await Promise.all(
      updates
        .filter((u: { id: string; status: string }) => validStatuses.includes(u.status))
        .map((u: { id: string; status: string }) =>
          prisma.lead.update({ where: { id: u.id }, data: { status: u.status as never } })
        )
    );

    return NextResponse.json({ updated: results.length });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
