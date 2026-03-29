export const DESIGN_DNA_SCREENSHOT_BUCKET = "garden-design-dna-screenshots";
export const DESIGN_DNA_SCREENSHOT_URL_TTL_SECONDS = 60 * 60 * 24;
export const DESIGN_DNA_SCREENSHOT_LABELS = ["top", "mid", "lower"] as const;

export type DesignDnaScreenshotLabel =
  (typeof DESIGN_DNA_SCREENSHOT_LABELS)[number];

export type DesignDnaScreenshotArtifact = {
  label: DesignDnaScreenshotLabel;
  bucket: string;
  path: string;
  contentType: "image/png";
  capturedAt: string;
  source: "browserbase-mcp" | "browserbase-session-cdp";
  signedUrl?: string | null;
};

function isScreenshotLabel(value: unknown): value is DesignDnaScreenshotLabel {
  return typeof value === "string" &&
    (DESIGN_DNA_SCREENSHOT_LABELS as readonly string[]).includes(value);
}

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function buildDesignDnaScreenshotPath(params: {
  userId: string;
  gardenId: string;
  gardenSiteId: string;
  label: DesignDnaScreenshotLabel;
}) {
  const { userId, gardenId, gardenSiteId, label } = params;

  return `${userId}/${gardenId}/${gardenSiteId}/${label}.png`;
}

export function getDesignDnaScreenshotArtifacts(
  analysisMetadata: unknown,
): DesignDnaScreenshotArtifact[] {
  const metadata = asRecord(analysisMetadata);
  const screenshots = metadata?.screenshots;

  if (!Array.isArray(screenshots)) {
    return [];
  }

  const artifacts: DesignDnaScreenshotArtifact[] = [];

  for (const entry of screenshots) {
    const record = asRecord(entry);

    if (!record) {
      continue;
    }

    const label = record.label;
    const bucket = record.bucket;
    const path = record.path;
    const contentType = record.contentType;
    const capturedAt = record.capturedAt;
    const source = record.source;
    const signedUrl = typeof record.signedUrl === "string"
      ? record.signedUrl
      : null;

    if (
      !isScreenshotLabel(label) ||
      typeof bucket !== "string" ||
      typeof path !== "string" ||
      contentType !== "image/png" ||
      typeof capturedAt !== "string" ||
      (source !== "browserbase-mcp" && source !== "browserbase-session-cdp")
    ) {
      continue;
    }

    artifacts.push({
      label,
      bucket,
      path,
      contentType,
      capturedAt,
      source,
      signedUrl,
    });
  }

  return artifacts.sort((left, right) =>
    DESIGN_DNA_SCREENSHOT_LABELS.indexOf(left.label) -
    DESIGN_DNA_SCREENSHOT_LABELS.indexOf(right.label)
  );
}
