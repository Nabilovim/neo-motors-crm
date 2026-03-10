import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "leads";

  try {
    let csv = "";

    if (type === "leads") {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        include: { assignedTo: { select: { name: true } } },
      });
      csv = "Nom,Email,Téléphone,Véhicule,Statut,Score,Niveau,Budget Min,Budget Max,Ville,Source,Assigné à,Créé le\n";
      for (const l of leads) {
        csv += `"${l.name}","${l.email || ""}","${l.phone || ""}","${l.vehicleInterest || ""}","${l.status}","${l.leadScore}","${l.qualificationLevel || ""}","${l.budgetMin || ""}","${l.budgetMax || ""}","${l.city || ""}","${l.source}","${l.assignedTo?.name || ""}","${l.createdAt.toISOString()}"\n`;
      }
    } else if (type === "appointments") {
      const appointments = await prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
        include: { assignedTo: { select: { name: true } } },
      });
      csv = "Nom,Email,Téléphone,Véhicule,Date,Heure,Lieu,Type,Statut,Assigné à,Créé le\n";
      for (const a of appointments) {
        csv += `"${a.name}","${a.email || ""}","${a.phone || ""}","${a.vehicle || ""}","${a.preferredDate?.toISOString().split("T")[0] || ""}","${a.preferredTime || ""}","${a.location || ""}","${a.appointmentType || ""}","${a.status}","${a.assignedTo?.name || ""}","${a.createdAt.toISOString()}"\n`;
      }
    } else if (type === "conversations") {
      const conversations = await prisma.conversation.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, source: true, contactName: true, contactPhone: true, contactEmail: true, summary: true, sentiment: true, messageCount: true, createdAt: true },
      });
      csv = "ID,Source,Nom,Téléphone,Email,Résumé,Sentiment,Messages,Créé le\n";
      for (const c of conversations) {
        csv += `"${c.id}","${c.source}","${c.contactName || ""}","${c.contactPhone || ""}","${c.contactEmail || ""}","${(c.summary || "").replace(/"/g, '""')}","${c.sentiment || ""}","${c.messageCount}","${c.createdAt.toISOString()}"\n`;
      }
    } else if (type === "vehicles") {
      const vehicles = await prisma.vehicle.findMany({ orderBy: { model: "asc" } });
      csv = "Modèle,Variante,Couleur,Prix,Stock,Statut,Créé le\n";
      for (const v of vehicles) {
        csv += `"${v.model}","${v.variant || ""}","${v.color || ""}","${v.price || ""}","${v.stockCount}","${v.status}","${v.createdAt.toISOString()}"\n`;
      }
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    // Add BOM for Excel UTF-8 compatibility
    const bom = "\uFEFF";
    return new Response(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="neo-motors-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Erreur export" }, { status: 500 });
  }
}
