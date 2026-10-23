import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            const isDeleting = options?.maxAge === 0;
            const cookieOpts = isDeleting
              ? options
              : {
                  ...options,
                  maxAge: undefined,
                  expires: undefined,
                };
            supabaseResponse.cookies.set(name, value, cookieOpts);
          });
        },
      },
    }
  );

  // Jangan ubah ini; memanggil getUser memastikan token sesi terverifikasi di server Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const hasActiveSession = request.cookies.get("wedora_session_active")?.value === "true";

  // 1. Tentukan rute publik yang boleh diakses siapa saja
  const isPublicRoute =
    path === "/login" ||
    path.startsWith("/konfirmasi") ||
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico";

  // 2. Jika mencoba mengakses rute admin (selain rute publik):
  // Harus terautentikasi dan memiliki sesi website yang aktif
  if (!isPublicRoute) {
    if (!user || !hasActiveSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redirectResponse = NextResponse.redirect(url);
      if (!hasActiveSession && request.cookies.has("wedora_session_active")) {
        redirectResponse.cookies.delete("wedora_session_active");
      }
      return redirectResponse;
    }
  }

  // 3. Jika sudah login dan memiliki sesi aktif, lalu membuka halaman /login
  if (user && hasActiveSession && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
