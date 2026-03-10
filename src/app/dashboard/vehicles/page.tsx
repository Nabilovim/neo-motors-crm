import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "./vehicles-client";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return <VehiclesClient vehicles={JSON.parse(JSON.stringify(vehicles))} />;
}