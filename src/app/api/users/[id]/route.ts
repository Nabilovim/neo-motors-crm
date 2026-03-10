import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role === "ADMIN" ? "ADMIN" : "SALES";
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.monthlyGoal !== undefined) data.monthlyGoal = parseInt(body.monthlyGoal, 10);

    const user = await prisma.crmUser.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true, monthlyGoal: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.lead.updateMany({
      where: { assignedToId: params.id },
      data: { assignedToId: null },
    });
    await prisma.appointment.updateMany({
      where: { assignedToId: params.id },
      data: { assignedToId: null },
    });

    await prisma.crmUser.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}