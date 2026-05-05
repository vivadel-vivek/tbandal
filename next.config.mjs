/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Hosts we'll serve real photography from once Phase 6 lands. Airtable
    // attachments come through v5.airtableusercontent.com; if we end up
    // blob-storing optimized variants on Vercel, those go through the
    // *.public.blob.vercel-storage.com hostname.
    remotePatterns: [
      { protocol: "https", hostname: "v5.airtableusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Once /tea/[vendor]/[slug] lands, add 301 redirects from the legacy
  // /tea/[slug] flat path so external links stay alive. Empty for now —
  // the legacy route still resolves until the slug migration ships.
  async redirects() {
    return [];
  },
};

export default nextConfig;
