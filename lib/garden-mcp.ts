import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { createClient } from "@/lib/supabase/server";

export const GARDEN_MCP_FUNCTION_SLUG = "garden-mcp";

const GARDEN_MCP_TOKEN_NAMESPACE = "gardn_mcp";
const GARDEN_MCP_TOKEN_PREFIX_LENGTH = 20;

export type GardenMcpTokenSummary = {
  id: string;
  garden_id: string;
  user_id: string;
  token_prefix: string;
  last_used_at: string | null;
  last_used_by: string | null;
  created_at: string;
  updated_at: string;
};

function hashGardenMcpToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createGardenMcpTokenValue() {
  return `${GARDEN_MCP_TOKEN_NAMESPACE}_${randomBytes(32).toString("base64url")}`;
}

function getTokenPrefix(token: string) {
  return token.slice(0, GARDEN_MCP_TOKEN_PREFIX_LENGTH);
}

async function requireOwnedGarden(userId: string, gardenId: string) {
  const supabase = await createClient();
  const { data: garden, error } = await supabase
    .from("gardens")
    .select("id")
    .eq("id", gardenId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!garden) {
    throw new Error("Garden not found.");
  }
}

export function getGardenMcpEndpoint() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${GARDEN_MCP_FUNCTION_SLUG}`;
}

export async function getGardenMcpTokenForUser(
  userId: string,
  gardenId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("garden_mcp_tokens")
    .select(
      [
        "id",
        "garden_id",
        "user_id",
        "token_prefix",
        "last_used_at",
        "last_used_by",
        "created_at",
        "updated_at",
      ].join(", "),
    )
    .eq("garden_id", gardenId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? null) as unknown) as GardenMcpTokenSummary | null;
}

export async function createOrRotateGardenMcpTokenForUser(
  userId: string,
  gardenId: string,
) {
  await requireOwnedGarden(userId, gardenId);

  const supabase = await createClient();
  const token = createGardenMcpTokenValue();
  const tokenHash = hashGardenMcpToken(token);
  const tokenPrefix = getTokenPrefix(token);

  const { data, error } = await supabase
    .from("garden_mcp_tokens")
    .upsert(
      {
        garden_id: gardenId,
        user_id: userId,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
        last_used_at: null,
        last_used_by: null,
      },
      {
        onConflict: "garden_id",
      },
    )
    .select(
      [
        "id",
        "garden_id",
        "user_id",
        "token_prefix",
        "last_used_at",
        "last_used_by",
        "created_at",
        "updated_at",
      ].join(", "),
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    token,
    tokenSummary: (data as unknown) as GardenMcpTokenSummary,
  };
}

export async function revokeGardenMcpTokenForUser(
  userId: string,
  gardenId: string,
) {
  await requireOwnedGarden(userId, gardenId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("garden_mcp_tokens")
    .delete()
    .eq("garden_id", gardenId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    deleted: Boolean(data),
  };
}
