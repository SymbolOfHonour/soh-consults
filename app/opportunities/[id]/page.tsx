import { notFound, permanentRedirect } from "next/navigation";
import { updates } from "../../../data/updates";

export default async function OpportunityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const opportunity = updates.find(
    (item) => item.id === Number(id) && item.isOpportunity
  );

  if (!opportunity) {
    notFound();
  }

  permanentRedirect(`/updates/${opportunity.id}`);
}