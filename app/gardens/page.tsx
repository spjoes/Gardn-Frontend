import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { listGardensForUser, requireAuthenticatedUser } from "@/lib/gardens";
import GardensClient from "@/components/gardens/GardensClient";

export default async function GardensPage() {
  const user = await requireAuthenticatedUser();

  let gardens: any[] = [];
  let schemaError: string | null = null;

  try {
    gardens = await listGardensForUser(user.id);
  } catch {
    schemaError =
      "The gardens tables are not live yet. Apply the Supabase migration in supabase/migrations and reload this page.";
  }

  return (
    <div className="min-h-screen flex flex-1 flex-col selection:bg-surface-highest selection:text-ink">
      <Navbar userEmail={user.email} />

      <main className="flex-1 px-6 pb-32 pt-40">
        <GardensClient initialGardens={gardens} schemaError={schemaError} />
      </main>

      <Footer />
    </div>
  );
}
