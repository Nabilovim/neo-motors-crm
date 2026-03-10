import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(vehicles);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const vehicle = await prisma.vehicle.create({
      data: {
        model: data.model,
        variant: data.variant || null,
        color: data.color || null,
        price: data.price ? parseFloat(data.price) : null,
        stockCount: data.stockCount ? parseInt(data.stockCount) : 1,
        status: data.status || "AVAILABLE",
        description: data.description || null,
        specs: data.specs || null,
        imageUrl: data.imageUrl || null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}