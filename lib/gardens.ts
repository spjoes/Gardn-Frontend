import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import {
  DESIGN_DNA_SCREENSHOT_URL_TTL_SECONDS,
  getDesignDnaScreenshotArtifacts,
  type DesignDnaScreenshotArtifact,
} from "@/lib/design-dna-screenshots";
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
  design_document: GardenSiteDesignDocumentSummary | null;
};

export type GardenSiteDesignDocumentSummary = {
  id: string;
  garden_site_id: string;
  model_provider: string;
  model_name: string;
  prompt_version: string;
  search_tags: string[];
  created_at: string;
  updated_at: string;
};

export type GardenSiteDesignDocument = GardenSiteDesignDocumentSummary & {
  source_url: string;
  document_markdown: string;
  style_fingerprint: Record<string, unknown>;
  analysis_metadata: Record<string, unknown>;
  screenshots: DesignDnaScreenshotArtifact[];
};

type GardenSiteDesignDocumentRecord = Omit<GardenSiteDesignDocument, "screenshots">;

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

  const rawSites = ((sitesResult.data ?? []) as unknown) as Array<
    Omit<GardenSite, "design_document">
  >;
  const siteIds = rawSites.map((site) => site.id);

  let designDocumentsBySiteId = new Map<string, GardenSiteDesignDocumentSummary>();

  if (siteIds.length > 0) {
    const { data: designDocuments, error: designDocumentsError } = await supabase
      .from("garden_site_design_documents")
      .select(
        [
          "id",
          "garden_site_id",
          "model_provider",
          "model_name",
          "prompt_version",
          "search_tags",
          "created_at",
          "updated_at",
        ].join(", "),
      )
      .in("garden_site_id", siteIds);

    if (designDocumentsError) {
      throw new Error(designDocumentsError.message);
    }

    designDocumentsBySiteId = new Map(
      (((designDocuments ?? []) as unknown) as GardenSiteDesignDocumentSummary[]).map(
        (document) => [document.garden_site_id, document],
      ),
    );
  }

  return {
    garden: ((gardenResult.data ?? null) as unknown) as Garden | null,
    sites: rawSites.map((site) => ({
      ...site,
      design_document: designDocumentsBySiteId.get(site.id) ?? null,
    })),
  };
}

async function signDesignDnaScreenshots(
  analysisMetadata: Record<string, unknown>,
) {
  const screenshotArtifacts = getDesignDnaScreenshotArtifacts(analysisMetadata);

  if (screenshotArtifacts.length === 0) {
    return [] as DesignDnaScreenshotArtifact[];
  }

  const supabase = await createClient();

  return await Promise.all(
    screenshotArtifacts.map(async (artifact) => {
      const { data, error } = await supabase
        .storage
        .from(artifact.bucket)
        .createSignedUrl(
          artifact.path,
          DESIGN_DNA_SCREENSHOT_URL_TTL_SECONDS,
        );

      return {
        ...artifact,
        signedUrl: error ? null : (data?.signedUrl ?? null),
      } satisfies DesignDnaScreenshotArtifact;
    }),
  );
}

export async function getGardenSiteDesignDocumentForUser(
  userId: string,
  gardenId: string,
  gardenSiteId: string,
) {
  const supabase = await createClient();

  const [gardenResult, siteResult, designDocumentResult] = await Promise.all([
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
      .eq("id", gardenSiteId)
      .eq("garden_id", gardenId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("garden_site_design_documents")
      .select(
        [
          "id",
          "garden_site_id",
          "source_url",
          "document_markdown",
          "style_fingerprint",
          "search_tags",
          "model_provider",
          "model_name",
          "prompt_version",
          "analysis_metadata",
          "created_at",
          "updated_at",
        ].join(", "),
      )
      .eq("garden_site_id", gardenSiteId)
      .maybeSingle(),
  ]);

  if (gardenResult.error) {
    throw new Error(gardenResult.error.message);
  }

  if (siteResult.error) {
    throw new Error(siteResult.error.message);
  }

  if (designDocumentResult.error) {
    throw new Error(designDocumentResult.error.message);
  }

  const rawDesignDocument = ((designDocumentResult.data ?? null) as unknown) as GardenSiteDesignDocumentRecord | null;
  const screenshots = rawDesignDocument
    ? await signDesignDnaScreenshots(rawDesignDocument.analysis_metadata ?? {})
    : [];

  const site = siteResult.data
    ? ({
        ...(((siteResult.data ?? null) as unknown) as Omit<
          GardenSite,
          "design_document"
        >),
        design_document: rawDesignDocument
          ? {
              id: rawDesignDocument.id,
              garden_site_id: rawDesignDocument.garden_site_id,
              model_provider: rawDesignDocument.model_provider,
              model_name: rawDesignDocument.model_name,
              prompt_version: rawDesignDocument.prompt_version,
              search_tags: rawDesignDocument.search_tags ?? [],
              created_at: rawDesignDocument.created_at,
              updated_at: rawDesignDocument.updated_at,
            }
          : null,
      } satisfies GardenSite)
    : null;

  return {
    garden: ((gardenResult.data ?? null) as unknown) as Garden | null,
    site,
    designDocument: rawDesignDocument
      ? {
          ...rawDesignDocument,
          screenshots,
        }
      : null,
  };
}
