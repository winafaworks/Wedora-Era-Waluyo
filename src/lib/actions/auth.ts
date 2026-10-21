"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email.trim(),
    password: formData.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "Email atau kata sandi yang Anda masukkan salah." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
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

  // Jika kata sandi lama diisi, verifikasi terlebih dahulu
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

  // Update password ke Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings", "page");
  return { success: true, message: "Kata sandi akun admin berhasil diperbarui!" };
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
