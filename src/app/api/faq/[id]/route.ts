import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updateData: Record<string, unknown> = {};

    if (data.question !== undefined) updateData.question = data.question.trim();
    if (data.answer !== undefined) updateData.answer = data.answer.trim();
    if (data.category !== undefined) updateData.category = data.category?.trim() || null;
    if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const faq = await prisma.fAQ.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(faq);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.fAQ.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}