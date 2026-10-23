import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          return document.cookie
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const [name, ...v] = c.split("=");
              return { name, value: v.join("=") };
            });
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;
          cookiesToSet.forEach(({ name, value, options }) => {
            const isDeleting = options?.maxAge === 0;
            let cookieStr = `${name}=${value}; path=${options?.path || "/"}; SameSite=${options?.sameSite || "Lax"}`;
            if (isDeleting) {
              cookieStr += "; max-age=0";
            }
            if (options?.secure || (typeof window !== "undefined" && window.location.protocol === "https:")) {
              cookieStr += "; Secure";
            }
            document.cookie = cookieStr;
          });
        },
      },
    }
  );
}
