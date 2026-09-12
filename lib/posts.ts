import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import Slugger from "github-slugger";
import type { Heading, Root as MdRoot } from "mdast";
import type { Element, Root as HRoot } from "hast";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: boolean;
  words: number;
  readingTime: string;
}

export interface TocItem {
  depth: number;
  text: string;
  id: string;
}

export interface Post extends PostMeta {
  content: string;
  html: string;
  toc: TocItem[];
}

export interface TagInfo {
  name: string;
  slug: string;
  count: number;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "posts");

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function parseDateUTC(date: string): Date {
  if (date.includes("T") || date.includes(" ")) return new Date(date);
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function formatDate(date: string, style: "long" | "medium" = "long"): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: style,
    timeZone: "UTC",
  }).format(parseDateUTC(date));
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function humanReadingTime(text: string): string {
  const minutes = Math.max(1, Math.round(countWords(text) / 200));
  return `${minutes} min`;
}

/* ------------------------------------------------------------------ */
/* markdown pipeline                                                   */
/* ------------------------------------------------------------------ */

function rehypeAddAnchors() {
  return (tree: HRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = node.properties?.id;
      if (!id || typeof id !== "string") return;
      node.children.unshift({
        type: "element",
        tagName: "a",
        properties: { href: `#${id}`, className: ["anchor"], "aria-hidden": "true" },
        children: [{ type: "text", value: "#" }],
      });
    });
  };
}

function rehypeWrapTables() {
  return (tree: HRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table") return;
      if (!parent || Array.isArray(parent.children) === false || typeof index !== "number") return;
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
      parent.children[index] = wrapper;
    });
  };
}

function renderMarkdown(content: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAddAnchors)
    .use(rehypeWrapTables)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(content);
  return String(file.value);
}

function flattenedHeadingText(node: Heading): string {
  const parts: string[] = [];
  const walk = (children: readonly unknown[]) => {
    for (const child of children) {
      if (typeof child === "string") {
        parts.push(child);
      } else if (child && typeof child === "object") {
        const c = child as { type?: string; value?: unknown; children?: unknown[] };
        if (c.type === "heading") continue;
        if (c.value !== undefined) parts.push(String(c.value));
        if (c.children) walk(c.children);
      }
    }
  };
  walk(node.children);
  return parts.join("").trim();
}

function extractToc(content: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(content) as MdRoot;
  const slugger = new Slugger();
  const toc: TocItem[] = [];
  visit(tree, "heading", (node: Heading) => {
    if (node.depth < 2 || node.depth > 3) return;
    const text = flattenedHeadingText(node);
    if (!text) return;
    toc.push({ depth: node.depth, text, id: slugger.slug(text) });
  });
  return toc;
}

/* ------------------------------------------------------------------ */
/* data access                                                         */
/* ------------------------------------------------------------------ */

function readPostFile(slug: string): { data: Record<string, unknown>; content: string; raw: string } | null {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return { data, content, raw };
}

function toMeta(
  slug: string,
  data: Record<string, unknown>,
  raw: string
): PostMeta {
  const words = countWords(raw.replace(/^---[\s\S]*?---/, ""));
  const date =
    (data.date as string | undefined) ??
    fs.statSync(path.join(CONTENT_DIR, `${slug}.md`)).mtime.toISOString().slice(0, 10);

  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    date,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    published: data.published === undefined ? true : Boolean(data.published),
    words,
    readingTime: humanReadingTime(raw.replace(/^---[\s\S]*?---/, "")),
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.toLowerCase().endsWith(".md"));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.md$/i, "");
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      return toMeta(slug, data, raw);
    })
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return posts;
}

export function getPost(slug: string): Post | null {
  const file = readPostFile(slug);
  if (!file) return null;
  const meta = toMeta(slug, file.data, file.raw);

  return {
    ...meta,
    content: file.content,
    html: renderMarkdown(file.content),
    toc: extractToc(file.content),
  };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .map((f) => f.replace(/\.md$/i, ""));
}

/* ------------------------------------------------------------------ */
/* tags                                                                */
/* ------------------------------------------------------------------ */

export function tagToSlug(name: string): string {
  return new Slugger().slug(name.trim());
}

export function getAllTags(): TagInfo[] {
  const map = new Map<string, { name: string; count: number }>();

  for (const post of getAllPosts()) {
    for (const raw of post.tags) {
      const name = raw.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { name, count: 1 });
    }
  }

  return Array.from(map.values())
    .map((t) => ({ name: t.name, slug: tagToSlug(t.name), count: t.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));
}

export function getPostsByTag(name: string): PostMeta[] {
  const needle = name.trim().toLowerCase();
  return getAllPosts().filter((p) =>
    p.tags.some((t) => t.trim().toLowerCase() === needle)
  );
}

export function findTagBySlug(slug: string): string | null {
  const exact = getAllTags().find((t) => t.slug === slug);
  if (exact) return exact.name;
  const fallback = getAllTags().find((t) => tagToSlug(t.name) === slug);
  return fallback?.name ?? null;
}