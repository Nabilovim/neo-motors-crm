import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promotions);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const promotion = await prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description,
        vehicleModel: data.vehicleModel || null,
        discountType: data.discountType || null,
        discountValue: data.discountValue ? parseFloat(data.discountValue) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}