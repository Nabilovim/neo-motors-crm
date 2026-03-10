import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.question?.trim() || !data.answer?.trim()) {
      return NextResponse.json({ error: "Question et réponse requises" }, { status: 400 });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        category: data.category?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Create FAQ error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}