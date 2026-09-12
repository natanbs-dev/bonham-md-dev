import { getAllPosts, formatDate } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const link = `${site.url}`;

  const items = posts
    .map((post) => {
      const url = `${link}/posts/${post.slug}`;
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${escapeXml(new Date(post.date + "T12:00:00Z").toUTCString())}</pubDate>
  <description>${escapeXml(post.description)}</description>
  ${post.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n  ")}
</item>`;
    })
    .join("\n  ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — blog de programação`)}</title>
    <link>${link}</link>
    <atom:link href="${link}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(site.description)}</description>
    <language>pt-br</language>
    <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>
  ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": 'inline; filename="rss.xml"',
      "Cache-Control": "no-store",
    },
  });
}