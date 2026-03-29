import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import GardenDetailClient from "@/components/gardens/GardenDetailClient";
import {
  getGardenMcpEndpoint,
  getGardenMcpTokenForUser,
} from "@/lib/garden-mcp";
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
  let mcpToken:
    | Awaited<ReturnType<typeof getGardenMcpTokenForUser>>
    | null = null;
  let mcpError: string | null = null;

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
  const mcpEndpoint = getGardenMcpEndpoint();

  if (garden) {
    try {
      mcpToken = await getGardenMcpTokenForUser(user.id, gardenId);
    } catch {
      mcpError =
        "The MCP connection layer is not live yet. Apply the latest Supabase migration and reload this garden.";
    }
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-surface-highest selection:text-ink">
      <Navbar userEmail={user.email} />

      <main className="flex-1">
        <GardenDetailClient 
          currentUserId={user.id}
          garden={garden ?? null}
          sites={sites}
          schemaError={schemaError}
          mcpToken={mcpToken}
          mcpEndpoint={mcpEndpoint}
          mcpError={mcpError}
        />
      </main>

      <Footer />
    </div>
  );
}
