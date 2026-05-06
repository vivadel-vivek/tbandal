import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const BASE = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/member/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
