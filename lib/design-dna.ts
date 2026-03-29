import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const DESIGN_DNA_FUNCTION_SLUG = "generate-design-dna";
const FALLBACK_FAILURE_MESSAGE =
  "Design DNA could not be queued. Check the Supabase function configuration and try again.";

function getDesignDnaFunctionEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase function environment variables. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { supabaseUrl, serviceRoleKey };
}

function buildDesignDnaFunctionUrl(supabaseUrl: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${DESIGN_DNA_FUNCTION_SLUG}`;
}

async function markQueuedGenerationFailed(
  gardenSiteId: string,
  message: string = FALLBACK_FAILURE_MESSAGE,
) {
  try {
    const supabase = createAdminClient();

    await supabase
      .from("garden_sites")
      .update({
        processing_status: "failed",
        processor_status_message: message,
        processed_at: new Date().toISOString(),
      })
      .eq("id", gardenSiteId);
  } catch (error) {
    console.error(
      "Unable to persist Design DNA queue failure for garden site",
      gardenSiteId,
      error,
    );
  }
}

export async function invokeGardenSiteDesignDna(gardenSiteId: string) {
  const { supabaseUrl, serviceRoleKey } = getDesignDnaFunctionEnv();
  const response = await fetch(buildDesignDnaFunctionUrl(supabaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ gardenSiteId }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Supabase function ${DESIGN_DNA_FUNCTION_SLUG} returned ${response.status}: ${responseText}`,
    );
  }
}

export async function enqueueGardenSiteDesignDna(gardenSiteId: string) {
  try {
    await invokeGardenSiteDesignDna(gardenSiteId);
  } catch (error) {
    console.error("Failed to queue Design DNA generation", error);
    await markQueuedGenerationFailed(gardenSiteId, FALLBACK_FAILURE_MESSAGE);
  }
}
