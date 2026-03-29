"use client";

import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createGardenMcpToken,
  revokeGardenMcpToken,
} from "@/app/gardens/actions";

type GardenMcpTokenSummary = {
  id: string;
  token_prefix: string;
  last_used_at: string | null;
  last_used_by: string | null;
  created_at: string;
  updated_at: string;
};

type GardenMcpPanelProps = {
  gardenId: string;
  gardenName: string;
  mcpToken: GardenMcpTokenSummary | null;
  mcpEndpoint: string | null;
  mcpError: string | null;
  totalSiteCount: number;
  analyzedSiteCount: number;
};

function formatTimestamp(value: string | null) {
  if (!value) {
    return "never";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildConnectionSnippet(endpoint: string, token: string) {
  return JSON.stringify(
    {
      url: endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json, text/event-stream",
      },
    },
    null,
    2,
  );
}

function buildCodexTomlSnippet(endpoint: string, envVarName: string) {
  return `[mcp_servers.gardn]
enabled = true
url = "${endpoint}"
bearer_token_env_var = "${envVarName}"`;
}

function buildPowerShellEnvSnippet(token: string, envVarName: string) {
  return `$env:${envVarName} = "${token}"`;
}

export default function GardenMcpPanel({
  gardenId,
  gardenName,
  mcpToken,
  mcpEndpoint,
  mcpError,
  totalSiteCount,
  analyzedSiteCount,
}: GardenMcpPanelProps) {
  const codexTokenEnvVarName = "GARDN_MCP_TOKEN";
  const [pending, startTokenTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<
    "token" | "config" | "codex" | "env" | null
  >(null);
  const router = useRouter();

  const pendingSiteCount = Math.max(totalSiteCount - analyzedSiteCount, 0);
  const tokenPreview = mcpToken ? `${mcpToken.token_prefix}...` : null;
  const connectionSnippet =
    revealedToken && mcpEndpoint
      ? buildConnectionSnippet(mcpEndpoint, revealedToken)
      : null;
  const codexTomlSnippet =
    mcpEndpoint ? buildCodexTomlSnippet(mcpEndpoint, codexTokenEnvVarName) : null;
  const powerShellEnvSnippet =
    revealedToken ? buildPowerShellEnvSnippet(revealedToken, codexTokenEnvVarName) : null;

  function resetCopiedLabelAfterDelay(
    label: "token" | "config" | "codex" | "env",
  ) {
    window.setTimeout(() => {
      setCopiedLabel((current) => (current === label ? null : current));
    }, 1600);
  }

  async function copyText(
    label: "token" | "config" | "codex" | "env",
    value: string,
  ) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      resetCopiedLabelAfterDelay(label);
    } catch {
      setMessage("Clipboard access failed. Copy the value manually for now.");
    }
  }

  return (
    <section className="ambient-panel rounded-[2.75rem] bg-surface-container-low px-6 py-8 sm:px-10 sm:py-10">
      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-variant/60">
              agent access
            </p>
            <h2 className="text-3xl leading-[0.95] tracking-tight lowercase text-ink md:text-4xl">
              connect this garden over mcp
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-ink-variant">
              Give an AI agent read-only access to <span className="text-ink">{gardenName}</span>{" "}
              so it can pull the saved DESIGN.md dossiers already analyzed in this
              collection.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.75rem] bg-surface px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                analyzed dossiers
              </p>
              <p className="mt-3 text-3xl font-medium tracking-tight lowercase text-ink">
                {analyzedSiteCount}
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-surface px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                pending seeds
              </p>
              <p className="mt-3 text-3xl font-medium tracking-tight lowercase text-ink">
                {pendingSiteCount}
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-surface px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                token status
              </p>
              <p className="mt-3 text-lg font-medium tracking-tight lowercase text-ink">
                {mcpToken ? "active" : "not issued"}
              </p>
            </div>
          </div>

          {mcpError ? (
            <div className="rounded-[1.75rem] bg-surface-high px-5 py-4 text-sm leading-relaxed text-ink-variant">
              {mcpError}
            </div>
          ) : mcpEndpoint ? (
            <div className="rounded-[1.75rem] bg-surface px-5 py-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                remote endpoint
              </p>
              <p className="mt-3 break-all font-mono text-[13px] leading-6 text-ink">
                {mcpEndpoint}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-variant/75">
                This server exposes `get_garden_overview`, `get_garden_design_dna_bundle`,
                and `get_design_dna_document`, plus read-only resources for the full garden
                bundle and each saved site&apos;s raw DESIGN.md. Bundles now include signed
                screenshot references when Gardn captured them during analysis.
              </p>
            </div>
          ) : (
            <div className="rounded-[1.75rem] bg-surface-high px-5 py-4 text-sm leading-relaxed text-ink-variant">
              The Supabase project URL is missing, so the MCP endpoint cannot be shown yet.
            </div>
          )}

          {message ? (
            <div className="rounded-[1.75rem] bg-surface-highest px-5 py-4 text-sm leading-relaxed text-ink-variant">
              {message}
            </div>
          ) : null}

          {revealedToken ? (
            <div className="space-y-4 rounded-[2rem] bg-surface px-5 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                    copy this token now
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-variant">
                    Gardn only shows the full MCP token once. If you lose it, rotate the token
                    and reconnect your agent.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyText("token", revealedToken)}
                  className="rounded-full bg-surface-highest px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high"
                >
                  {copiedLabel === "token" ? "copied token" : "copy token"}
                </button>
              </div>

              <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] bg-surface-container px-4 py-4 font-mono text-[13px] leading-6 text-ink">
                {revealedToken}
              </pre>

              {connectionSnippet ? (
                <div className="space-y-3">
                  {codexTomlSnippet ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                          codex config.toml snippet
                        </p>
                        <button
                          type="button"
                          onClick={() => copyText("codex", codexTomlSnippet)}
                          className="rounded-full bg-surface-highest px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high"
                        >
                          {copiedLabel === "codex" ? "copied codex snippet" : "copy codex snippet"}
                        </button>
                      </div>

                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] bg-surface-container px-4 py-4 font-mono text-[13px] leading-6 text-ink">
                        {codexTomlSnippet}
                      </pre>

                      <p className="text-sm leading-relaxed text-ink-variant">
                        Codex expects <span className="font-mono text-ink">bearer_token_env_var</span>{" "}
                        to be an environment variable name, not the token itself. Restart Codex
                        after updating the config so it reloads the MCP server list.
                      </p>
                    </div>
                  ) : null}

                  {powerShellEnvSnippet ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                          powershell env snippet
                        </p>
                        <button
                          type="button"
                          onClick={() => copyText("env", powerShellEnvSnippet)}
                          className="rounded-full bg-surface-highest px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high"
                        >
                          {copiedLabel === "env" ? "copied env snippet" : "copy env snippet"}
                        </button>
                      </div>

                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] bg-surface-container px-4 py-4 font-mono text-[13px] leading-6 text-ink">
                        {powerShellEnvSnippet}
                      </pre>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                      generic remote mcp config
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText("config", connectionSnippet)}
                      className="rounded-full bg-surface-highest px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high"
                    >
                      {copiedLabel === "config" ? "copied config" : "copy config"}
                    </button>
                  </div>

                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] bg-surface-container px-4 py-4 font-mono text-[13px] leading-6 text-ink">
                    {connectionSnippet}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] bg-surface px-5 py-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
              issued credential
            </p>

            {mcpToken ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.5rem] bg-surface-container px-4 py-4">
                  <p className="font-mono text-[13px] leading-6 text-ink">{tokenPreview}</p>
                </div>

                <div className="space-y-2 text-sm leading-relaxed text-ink-variant">
                  <p>created {formatTimestamp(mcpToken.created_at)}</p>
                  <p>rotated {formatTimestamp(mcpToken.updated_at)}</p>
                  <p>last used {formatTimestamp(mcpToken.last_used_at)}</p>
                  <p>
                    client{" "}
                    {mcpToken.last_used_by?.trim()
                      ? mcpToken.last_used_by
                      : "has not connected yet"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-ink-variant">
                No MCP token has been issued for this garden yet.
              </p>
            )}
          </div>

          <div className="rounded-[2rem] bg-surface px-5 py-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
              lifecycle
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                disabled={pending || Boolean(mcpError)}
                onClick={() => {
                  setMessage(null);

                  startTokenTransition(() => {
                    startTransition(async () => {
                      const result = await createGardenMcpToken(gardenId);

                      if (result?.error) {
                        setMessage(result.error);
                        return;
                      }

                      setRevealedToken(result?.token ?? null);
                      setMessage(
                        result?.success ??
                          "Garden MCP token ready. Copy it now before leaving this page.",
                      );
                      router.refresh();
                    });
                  });
                }}
                className="brand-gradient rounded-2xl px-5 py-4 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending
                  ? mcpToken
                    ? "rotating token..."
                    : "creating token..."
                  : mcpToken
                    ? "rotate token"
                    : "create token"}
              </button>

              {mcpToken ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Revoke this garden MCP token? Connected agents will lose access immediately.",
                    );

                    if (!confirmed) {
                      return;
                    }

                    setMessage(null);

                    startTokenTransition(() => {
                      startTransition(async () => {
                        const result = await revokeGardenMcpToken(gardenId);

                        if (result?.error) {
                          setMessage(result.error);
                          return;
                        }

                        setRevealedToken(null);
                        setMessage(result?.success ?? "Garden MCP access revoked.");
                        router.refresh();
                      });
                    });
                  }}
                  className="rounded-2xl bg-surface-highest px-5 py-4 text-sm font-medium tracking-wide text-ink-variant transition-colors hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pending ? "revoking..." : "revoke token"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] bg-surface px-5 py-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
              agent flow
            </p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-variant">
              <p>1. Connect your MCP client to the remote endpoint with the bearer token.</p>
              <p>2. Call `get_garden_design_dna_bundle` to load every analyzed dossier and its screenshot references in this garden.</p>
              <p>3. Fetch `gardn://sites/&lt;siteId&gt;/design-dna.md` when you need a single raw DESIGN.md.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
