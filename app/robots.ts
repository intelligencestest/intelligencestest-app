import type { MetadataRoute } from "next";

/**
 * Safety and brand control, not SEO: the WordPress site owns public ranking.
 * The app only exposes its entrance pages to crawlers; every product,
 * candidate, and admin route is disallowed. No sitemap on purpose — there is
 * nothing here to rank. (nginx proxies /robots.txt to this route.)
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/dashboard",
    "/inbox",
    "/projects",
    "/candidates",
    "/assessments",
    "/reports",
    "/settings",
    "/admin",
    "/onboarding",
    "/test/",
    "/api/",
    "/auth/",
    "/dev/",
  ];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...privatePaths, ...privatePaths.map((path) => `/es${path}`)],
    },
  };
}
