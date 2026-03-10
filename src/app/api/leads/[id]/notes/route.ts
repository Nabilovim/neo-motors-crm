import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notes = await prisma.leadNote.findMany({
      where: { leadId: params.id },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { content, authorId } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Le contenu est requis" }, { status: 400 });
    }

    const note = await prisma.leadNote.create({
      data: {
        leadId: params.id,
        authorId: authorId || null,
        content: content.trim(),
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}