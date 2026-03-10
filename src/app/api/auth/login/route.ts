import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!validateCredentials(email, password)) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const token = signToken(email);

    const response = NextResponse.json({ success: true });
    response.cookies.set("crm_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}