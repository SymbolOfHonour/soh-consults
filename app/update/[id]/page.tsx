import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyUpdatePage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/updates/${id}`);
}
