"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from "@/lib/security/rate-limit";
import { validatePasswordStrength } from "@/lib/security/password-policy";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { sanitizeText } from "@/lib/security/sanitize";

export async function login(formData: { email: string; password: string }) {
  const cleanEmail = sanitizeText(formData.email).toLowerCase();
  const password = formData.password;

  // 1. Periksa batas laju percobaan login (Rate Limiting Defense)
  const rateLimit = checkLoginRateLimit(cleanEmail);
  if (!rateLimit.allowed) {
    logSecurityEvent(
      "RATE_LIMIT_BLOCKED",
      cleanEmail,
      `Login diblokir otomatis karena melebihi batas salah (Tunggu ${rateLimit.retryAfterMinutes} menit).`,
      "danger"
    );
    return {
      success: false,
      error: `Terlalu banyak percobaan masuk yang salah. Demi keamanan, akun dibekukan sementara. Silakan coba kembali dalam ${rateLimit.retryAfterMinutes} menit.`,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    const attemptResult = recordFailedLogin(cleanEmail);
    logSecurityEvent(
      "LOGIN_FAILED",
      cleanEmail,
      `Percobaan login gagal (Sisa kesempatan: ${attemptResult.remainingAttempts}).`,
      "warning"
    );

    if (attemptResult.isBlocked) {
      return {
        success: false,
        error: `Batas percobaan login tercapai. Akun dibekukan sementara selama ${attemptResult.retryAfterMinutes} menit demi keamanan siber.`,
      };
    }

    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        error: `Email atau kata sandi salah. Sisa kesempatan: ${attemptResult.remainingAttempts} kali sebelum dibekukan.`,
      };
    }
    return { success: false, error: error.message };
  }

  // Login berhasil: reset counter & catat audit log
  resetLoginRateLimit(cleanEmail);
  logSecurityEvent(
    "LOGIN_SUCCESS",
    cleanEmail,
    "Autentikasi administrator berhasil. Sesi aman dimulai.",
    "success"
  );

  // Set cookie sesi aktif (Session Cookie: tanpa maxAge/expires, terhapus saat browser ditutup)
  const cookieStore = await cookies();
  cookieStore.set("wedora_session_active", "true", {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email) {
    logSecurityEvent("LOGOUT", user.email, "Administrator mengakhiri sesi (Logout).", "info");
  }

  await supabase.auth.signOut();

  // Hapus cookie sesi aktif
  const cookieStore = await cookies();
  cookieStore.delete("wedora_session_active");

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function updatePassword(data: {
  currentPassword?: string;
  newPassword: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Sesi admin tidak ditemukan. Silakan masuk kembali." };
  }

  // 1. Enforce Strong Password Policy (Kebijakan Kata Sandi Kuat)
  const validation = validatePasswordStrength(data.newPassword);
  if (!validation.isValid) {
    return {
      success: false,
      error: `Kata sandi belum memenuhi standar keamanan: ${validation.errors.join(" ")}`,
    };
  }

  // 2. Jika kata sandi lama diisi, verifikasi terlebih dahulu
  if (data.currentPassword) {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        error: "Kata sandi saat ini yang Anda masukkan salah. Mohon periksa kembali.",
      };
    }
  }

  // 3. Update password ke Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // 4. Catat Audit Trail
  logSecurityEvent(
    "PASSWORD_CHANGED",
    user.email,
    "Kata sandi akun administrator berhasil diperbarui sesuai standar keamanan siber.",
    "success"
  );

  revalidatePath("/settings", "page");
  return { success: true, message: "Kata sandi akun admin berhasil diperbarui dengan standar keamanan kuat!" };
}

export async function getAccountSecurityDetails() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "admin@erawaluyo.com",
    role: "Administrator",
    lastSignInAt: user.last_sign_in_at || null,
    createdAt: user.created_at || null,
  };
}
