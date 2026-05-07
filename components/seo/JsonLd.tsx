/**
 * JSON-LD structured data — emitted as a server component so AI/LLM
 * crawlers and search engines can parse rich data from the static HTML
 * without executing JS.
 *
 * One default export per schema type to keep call-sites tidy:
 *   <ArticleJsonLd ... /> in journal post pages
 *   <ProductReviewJsonLd ... /> in tea-detail pages
 *   <ItemListJsonLd ... /> in directory/listing pages
 */

import type { Tea, Post, Vendor, Teaware } from "@/lib/types";
import { teaUrl, teaAvg } from "@/lib/tea-helpers";
import { getSiteUrl } from "@/lib/site-url";

const SITE = getSiteUrl();

function emit(data: unknown) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Editorial article — for /journal/[slug] pages. */
export function ArticleJsonLd({ post }: { post: Post }) {
  const url = `${SITE}/journal/${post.slug}`;
  return emit({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      url: `${SITE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Two Buds and a Leaf",
      url: SITE,
    },
    articleSection: post.cat,
    timeRequired: `PT${post.readTime}M`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  });
}

/** Tea review — modeled as Product with Reviews. Aggregate rating from
 *  Vivek + James + members composite. */
export function ProductReviewJsonLd({ tea }: { tea: Tea }) {
  const url = `${SITE}${teaUrl(tea)}`;
  const reviews: object[] = [];
  if (tea.reviews.vivek) {
    reviews.push({
      "@type": "Review",
      author: { "@type": "Person", name: "Vivek" },
      reviewRating: {
        "@type": "Rating",
        ratingValue: tea.reviews.vivek.rating,
        bestRating: 10,
      },
      datePublished: tea.reviews.vivek.date,
      reviewBody: tea.reviews.vivek.body,
    });
  }
  if (tea.reviews.james) {
    reviews.push({
      "@type": "Review",
      author: { "@type": "Person", name: "James" },
      reviewRating: {
        "@type": "Rating",
        ratingValue: tea.reviews.james.rating,
        bestRating: 10,
      },
      datePublished: tea.reviews.james.date,
      reviewBody: tea.reviews.james.body,
    });
  }

  const avgRating = teaAvg(tea);
  const totalReviewCount =
    (tea.reviews.vivek ? 1 : 0) +
    (tea.reviews.james ? 1 : 0) +
    (tea.reviews.members?.count ?? 0);

  return emit({
    "@context": "https://schema.org",
    "@type": "Product",
    name: tea.name,
    description: tea.summary,
    url,
    brand: { "@type": "Brand", name: tea.vendor },
    category: tea.type,
    offers: {
      "@type": "Offer",
      price: tea.price,
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: tea.price,
        priceCurrency: "USD",
        unitText: "g",
      },
    },
    aggregateRating: avgRating
      ? {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          bestRating: 10,
          ratingCount: totalReviewCount,
        }
      : undefined,
    review: reviews,
  });
}

/** Directory / listing — for /discover/teas, /discover/teaware,
 *  /discover/vendors. Exposes the items so crawlers can index the
 *  member pages without the full HTML pass. */
export function ItemListJsonLd({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: { url: string; name: string }[];
}) {
  return emit({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url,
      name: it.name,
    })),
  });
}

/** Re-export helpers so the call-site can build item lists ergonomically. */
export function teaListItems(teas: Tea[]) {
  return teas.map((t) => ({ url: `${SITE}${teaUrl(t)}`, name: t.name }));
}

export function vendorListItems(vendors: Vendor[]) {
  return vendors.map((v) => ({
    url: `${SITE}/discover/vendors/${v.slug}`,
    name: v.name,
  }));
}

export function teawareListItems(items: Teaware[]) {
  return items.map((t) => ({
    url: `${SITE}/discover/teaware/${t.slug}`,
    name: t.name,
  }));
}
