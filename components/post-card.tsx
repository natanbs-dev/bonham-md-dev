import Link from "next/link";
import { formatDate, tagToSlug, type PostMeta } from "@/lib/posts";
import Reveal from "@/components/reveal";

export default function PostCard({
  post,
  index,
  delay = 0,
}: {
  post: PostMeta;
  index: number;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="post-card">
        <div className="post-card__top">
          <span className="post-card__number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="post-card__date">{formatDate(post.date, "medium")}</span>
        </div>

        <h3 className="post-card__title">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="post-card__excerpt">{post.description}</p>

        <div className="post-card__meta">
          {post.tags.slice(0, 3).map((t) => (
            <Link key={t} href={`/tags/${tagToSlug(t)}`} className="tag tag--link">
              #{t}
            </Link>
          ))}
          <span className="post-card__read">{post.readingTime} de leitura</span>
        </div>

        <Link
          href={`/posts/${post.slug}`}
          className="post-card__arrow"
          aria-hidden
          tabIndex={-1}
        >
          →
        </Link>
      </div>
    </Reveal>
  );
}