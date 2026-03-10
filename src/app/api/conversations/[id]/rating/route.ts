import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rating = await prisma.aIQualityRating.findFirst({
      where: { conversationId: params.id },
      include: { ratedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rating);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { rating, feedback, ratedById } = await req.json();

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Note entre 1 et 5 requise" }, { status: 400 });
    }

    const created = await prisma.aIQualityRating.create({
      data: {
        conversationId: params.id,
        rating,
        feedback: feedback || null,
        ratedById: ratedById || null,
      },
      include: { ratedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
