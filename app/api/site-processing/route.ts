type SiteProcessingRequest = {
  gardenId: string;
  gardenSiteId: string;
  siteUrl: string;
  userId: string;
};

function isValidPayload(payload: unknown): payload is SiteProcessingRequest {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<SiteProcessingRequest>;

  return (
    typeof candidate.gardenId === "string" &&
    typeof candidate.gardenSiteId === "string" &&
    typeof candidate.siteUrl === "string" &&
    typeof candidate.userId === "string"
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!isValidPayload(payload)) {
    return Response.json(
      {
        error: "Invalid processing payload.",
      },
      {
        status: 400,
      },
    );
  }

  // This is the handoff point for the real processing worker or external service.
  return Response.json(
    {
      accepted: true,
      status: "queued",
      receivedAt: new Date().toISOString(),
      gardenId: payload.gardenId,
      gardenSiteId: payload.gardenSiteId,
      siteUrl: payload.siteUrl,
    },
    {
      status: 202,
    },
  );
}
