import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TimelineItem {
  type: "message" | "event" | "note" | "appointment";
  data: Record<string, unknown>;
  createdAt: string;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: { id: true, conversationId: true, updatedAt: true, status: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
    }

    const timeline: TimelineItem[] = [];

    // Lead notes
    const notes = await prisma.leadNote.findMany({
      where: { leadId: params.id },
      include: { author: { select: { id: true, name: true } } },
    });
    for (const note of notes) {
      timeline.push({ type: "note", data: note as unknown as Record<string, unknown>, createdAt: note.createdAt.toISOString() });
    }

    // Conversation-linked items
    if (lead.conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId: lead.conversationId },
      });
      for (const msg of messages) {
        timeline.push({ type: "message", data: msg as unknown as Record<string, unknown>, createdAt: msg.createdAt.toISOString() });
      }

      const events = await prisma.conversationEvent.findMany({
        where: { conversationId: lead.conversationId },
      });
      for (const evt of events) {
        timeline.push({ type: "event", data: evt as unknown as Record<string, unknown>, createdAt: evt.createdAt.toISOString() });
      }

      const appointments = await prisma.appointment.findMany({
        where: { conversationId: lead.conversationId },
      });
      for (const apt of appointments) {
        timeline.push({ type: "appointment", data: apt as unknown as Record<string, unknown>, createdAt: apt.createdAt.toISOString() });
      }
    }

    // Sort newest first
    timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(timeline);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
