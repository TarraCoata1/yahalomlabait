import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://www.yahalom-la-bait.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );

        const [{ data: cats }, { data: prods }] = await Promise.all([
          supabase.from("categories").select("slug").eq("is_active", true),
          supabase.from("products").select("slug").eq("is_hidden", false),
        ]);

        const paths = [
          "/", "/shop", "/custom", "/about", "/contact",
          "/faq", "/shipping", "/returns", "/privacy", "/terms", "/hanging-guide",
          ...(cats ?? []).map((c) => `/shop?cat=${c.slug}`),
          ...(prods ?? []).map((p) => `/product/${p.slug}`),
        ];
        const urls = paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
