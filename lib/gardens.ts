import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type Garden = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type GardenSite = {
  id: string;
  garden_id: string;
  user_id: string;
  site_url: string;
  normalized_url: string;
  processing_status: string;
  processor_status_message: string | null;
  processing_requested_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

const SIGN_IN_MESSAGE = encodeURIComponent("Sign in to manage your gardens.");

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/sign-in?message=${SIGN_IN_MESSAGE}`);
  }

  return user;
}

export async function listGardensForUser(userId: string): Promise<Garden[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gardens")
    .select("id, user_id, name, description, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as Garden[];
}

export async function getGardenDetailForUser(userId: string, gardenId: string) {
  const supabase = await createClient();

  const [gardenResult, sitesResult] = await Promise.all([
    supabase
      .from("gardens")
      .select("id, user_id, name, description, created_at, updated_at")
      .eq("id", gardenId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("garden_sites")
      .select(
        [
          "id",
          "garden_id",
          "user_id",
          "site_url",
          "normalized_url",
          "processing_status",
          "processor_status_message",
          "processing_requested_at",
          "processed_at",
          "created_at",
          "updated_at",
        ].join(", "),
      )
      .eq("garden_id", gardenId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (gardenResult.error) {
    throw new Error(gardenResult.error.message);
  }

  if (sitesResult.error) {
    throw new Error(sitesResult.error.message);
  }

  return {
    garden: ((gardenResult.data ?? null) as unknown) as Garden | null,
    sites: ((sitesResult.data ?? []) as unknown) as GardenSite[],
  };
}
