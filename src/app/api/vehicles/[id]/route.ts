import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updateData: Record<string, unknown> = {};

    if (data.model !== undefined) updateData.model = data.model;
    if (data.variant !== undefined) updateData.variant = data.variant || null;
    if (data.color !== undefined) updateData.color = data.color || null;
    if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null;
    if (data.stockCount !== undefined) updateData.stockCount = parseInt(data.stockCount);
    if (data.status !== undefined) {
      const validStatuses = ["AVAILABLE", "RESERVED", "SOLD"];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      updateData.status = data.status;
    }
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.specs !== undefined) updateData.specs = data.specs;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}