"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/gardens";
import { createClient } from "@/lib/supabase/server";

export type GardenFormState =
  | {
      error?: string;
      success?: string;
    }
  | undefined;

export type DeleteGardenSiteState = {
  error?: string;
  success?: string;
};

const GARDEN_NAME_LIMIT = 80;
const GARDEN_DESCRIPTION_LIMIT = 280;
const URL_INPUT_LIMIT = 2048;

function normalizeSiteUrl(rawUrl: string) {
  try {
    const source = rawUrl.trim();

    if (!source) {
      return null;
    }

    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(source);
    const parsed = new URL(hasProtocol ? source : `https://${source}`);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();

    return parsed.toString();
  } catch {
    return null;
  }
}

export async function createGarden(
  _: GardenFormState,
  formData: FormData,
): Promise<GardenFormState> {
  const user = await requireAuthenticatedUser();

  const name = String(formData.get("name") ?? "").trim();
  const rawDescription = String(formData.get("description") ?? "").trim();
  const description = rawDescription.length > 0 ? rawDescription : null;

  if (name.length < 2) {
    return {
      error: "Give your garden a name with at least 2 characters.",
    };
  }

  if (name.length > GARDEN_NAME_LIMIT) {
    return {
      error: `Garden names need to stay under ${GARDEN_NAME_LIMIT} characters.`,
    };
  }

  if (description && description.length > GARDEN_DESCRIPTION_LIMIT) {
    return {
      error: `Descriptions need to stay under ${GARDEN_DESCRIPTION_LIMIT} characters.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gardens")
    .insert({
      user_id: user.id,
      name,
      description,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        error: "You already have a garden with that name.",
      };
    }

    return {
      error:
        "The gardens backend is not ready yet. Apply the new Supabase migration and try again.",
    };
  }

  revalidatePath("/gardens");
  redirect(`/gardens/${data.id}`);
}

export async function addSiteToGarden(
  gardenId: string,
  _: GardenFormState,
  formData: FormData,
): Promise<GardenFormState> {
  const user = await requireAuthenticatedUser();
  const rawSiteUrl = String(formData.get("siteUrl") ?? "").trim();

  if (!rawSiteUrl) {
    return {
      error: "Paste a site URL to save it into this garden.",
    };
  }

  if (rawSiteUrl.length > URL_INPUT_LIMIT) {
    return {
      error: "That URL is too long to store.",
    };
  }

  const normalizedUrl = normalizeSiteUrl(rawSiteUrl);

  if (!normalizedUrl) {
    return {
      error: "Enter a valid http or https URL.",
    };
  }

  const supabase = await createClient();
  const { data: garden, error: gardenError } = await supabase
    .from("gardens")
    .select("id")
    .eq("id", gardenId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (gardenError) {
    return {
      error:
        "The gardens backend is not ready yet. Apply the new Supabase migration and try again.",
    };
  }

  if (!garden) {
    return {
      error: "That garden could not be found.",
    };
  }

  const { error: insertError } = await supabase
    .from("garden_sites")
    .insert({
      garden_id: garden.id,
      user_id: user.id,
      site_url: rawSiteUrl,
      normalized_url: normalizedUrl,
      processing_status: "ready",
      processing_requested_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      processor_status_message: "Saved to this garden.",
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        error: "That URL is already saved in this garden.",
      };
    }

    return {
      error:
        "The gardens backend is not ready yet. Apply the new Supabase migration and try again.",
    };
  }

  revalidatePath("/gardens");
  revalidatePath(`/gardens/${gardenId}`);

  return {
    success: "Site saved to this garden.",
  };
}

export async function deleteGardenSite(
  gardenId: string,
  gardenSiteId: string,
): Promise<DeleteGardenSiteState> {
  const user = await requireAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("garden_sites")
    .delete()
    .eq("id", gardenSiteId)
    .eq("garden_id", gardenId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      error:
        "The site could not be removed right now. Check your Supabase schema and try again.",
    };
  }

  if (!data) {
    return {
      error: "That saved site could not be found.",
    };
  }

  revalidatePath("/gardens");
  revalidatePath(`/gardens/${gardenId}`);

  return {
    success: "Site removed from this garden.",
  };
}
