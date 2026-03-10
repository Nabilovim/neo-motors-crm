import { prisma } from "@/lib/prisma";
import { PromotionsClient } from "./promotions-client";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  const vehicles = await prisma.vehicle.findMany({
    select: { model: true },
    distinct: ["model"],
    orderBy: { model: "asc" },
  });

  const vehicleModels = vehicles.map((v) => v.model);

  return (
    <PromotionsClient
      promotions={JSON.parse(JSON.stringify(promotions))}
      vehicleModels={vehicleModels}
    />
  );
}