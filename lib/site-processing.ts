import "server-only";

import { headers } from "next/headers";

export type GardenSiteProcessingPayload = {
  gardenId: string;
  gardenSiteId: string;
  siteUrl: string;
  userId: string;
};

type ProcessingDispatchResult = {
  accepted: boolean;
  message: string;
};

function getInternalOrigin(headerList: Headers): string | null {
  const origin = headerList.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    return null;
  }

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

function resolveProcessorUrl(
  configuredUrl: string | undefined,
  headerList: Headers,
): string | null {
  if (configuredUrl) {
    if (
      configuredUrl.startsWith("http://") ||
      configuredUrl.startsWith("https://")
    ) {
      return configuredUrl;
    }

    const origin = getInternalOrigin(headerList);

    if (!origin) {
      return null;
    }

    return new URL(configuredUrl, origin).toString();
  }

  const origin = getInternalOrigin(headerList);

  if (!origin) {
    return null;
  }

  return new URL("/api/site-processing", origin).toString();
}

export async function dispatchGardenSiteToProcessor(
  payload: GardenSiteProcessingPayload,
): Promise<ProcessingDispatchResult> {
  const headerList = await headers();
  const processorUrl = resolveProcessorUrl(
    process.env.GARDN_SITE_PROCESSOR_URL?.trim(),
    headerList,
  );

  if (!processorUrl) {
    return {
      accepted: false,
      message: "Processor endpoint is not configured yet.",
    };
  }

  try {
    const response = await fetch(processorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        accepted: false,
        message: `Processor endpoint responded with ${response.status}.`,
      };
    }

    return {
      accepted: true,
      message: "Queued for processing.",
    };
  } catch {
    return {
      accepted: false,
      message: "Processor endpoint is not reachable yet.",
    };
  }
}
