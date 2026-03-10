import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ratings = await prisma.customerSatisfaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        conversation: {
          select: { contactName: true, contactPhone: true, source: true },
        },
      },
    });

    const total = ratings.length;
    const avgRating = total > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / total : 0;
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: ratings.filter((r) => r.rating === star).length,
    }));

    return NextResponse.json({
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      distribution,
      recent: ratings.slice(0, 20).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        contact: r.conversation?.contactName || r.conversation?.contactPhone || "Anonyme",
        source: r.conversation?.source || "WEB",
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Satisfaction API error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}