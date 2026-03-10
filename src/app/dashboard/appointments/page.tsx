import { prisma } from "@/lib/prisma";
import { AppointmentsClient } from "./appointments-client";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <AppointmentsClient appointments={JSON.parse(JSON.stringify(appointments))} />;
}
