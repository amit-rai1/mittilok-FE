import { Link, useParams } from "react-router-dom";
import { PageShell } from "../components/ui";
import { blogPosts } from "../data/catalog";
import { usePageTitle } from "../lib/format";

export function BlogPage() {
  usePageTitle("Blog");
  return (
    <PageShell eyebrow="Gardening Blog" title="Care tips for Indian homes" text="SEO-friendly articles for seasonal gardening, balcony care, orchids, indoor plants, and fertilizers.">
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <Link className="blog-card" to={`/blog/${post.slug}`} key={post.id}>
            <img src={post.coverImage} alt={post.title} />
            <span>{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <small>{post.date} • {post.readingTime}</small>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

export function BlogArticlePage() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug) ?? blogPosts[0];
  usePageTitle(post.title);
  return (
    <PageShell eyebrow={post.category} title={post.title} text={`${post.date} • ${post.readingTime}`}>
      <img className="article-image" src={post.coverImage} alt={post.title} />
      <p className="article-copy">{post.content}</p>
    </PageShell>
  );
}

export function PolicyPage({ title }: { title: string }) {
  usePageTitle(title);
  return (
    <PageShell eyebrow="Policy" title={title} text="Clear, customer-friendly policy content ready for legal review.">
      <p className="article-copy">MittiLok protects customer information, handles orders transparently, and resolves plant delivery issues through documented support workflows.</p>
    </PageShell>
  );
}
