import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import GardenDetailClient from "@/components/gardens/GardenDetailClient";
import { getGardenDetailForUser, requireAuthenticatedUser } from "@/lib/gardens";

type GardenDetailPageProps = {
  params: Promise<{
    gardenId: string;
  }>;
};

export default async function GardenDetailPage({
  params,
}: GardenDetailPageProps) {
  const { gardenId } = await params;
  const user = await requireAuthenticatedUser();

  let detail:
    | Awaited<ReturnType<typeof getGardenDetailForUser>>
    | null = null;
  let schemaError: string | null = null;

  try {
    detail = await getGardenDetailForUser(user.id, gardenId);
  } catch {
    schemaError =
      "The gardens tables are not live yet. Apply the Supabase migration in supabase/migrations and reload this page.";
  }

  if (!schemaError && !detail?.garden) {
    notFound();
  }

  const garden = detail?.garden;
  const sites = detail?.sites ?? [];

  return (
    <div className="min-h-screen flex flex-col selection:bg-surface-highest selection:text-ink">
      <Navbar userEmail={user.email} />

      <main className="flex-1">
        <GardenDetailClient 
          garden={garden ?? null} 
          sites={sites} 
          schemaError={schemaError} 
        />
      </main>

      <Footer />
    </div>
  );
}
