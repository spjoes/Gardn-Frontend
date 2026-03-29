import {
  getAuthenticatedUser,
  getGardenSiteDesignDocumentForUser,
} from "@/lib/gardens";

type DesignMarkdownRouteProps = {
  params: Promise<{
    gardenId: string;
    siteId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: DesignMarkdownRouteProps,
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { gardenId, siteId } = await params;
  const detail = await getGardenSiteDesignDocumentForUser(user.id, gardenId, siteId);

  if (!detail.garden || !detail.site || !detail.designDocument) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(detail.designDocument.document_markdown, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'inline; filename="DESIGN.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
