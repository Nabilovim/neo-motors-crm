import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  monthlyGoal: true,
  createdAt: true,
  _count: { select: { assignedLeads: true, assignedAppointments: true } },
} as const;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export async function GET() {
  try {
    const users = await prisma.crmUser.findMany({
      orderBy: { name: "asc" },
      select: USER_SELECT,
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, monthlyGoal } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nom, email et mot de passe requis" }, { status: 400 });
    }

    const existing = await prisma.crmUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const user = await prisma.crmUser.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role: role === "ADMIN" ? "ADMIN" : "SALES",
        monthlyGoal: monthlyGoal ? parseInt(monthlyGoal, 10) : 10,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, monthlyGoal: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}