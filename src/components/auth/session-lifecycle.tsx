"use client";

import { useEffect, useRef } from "react";
import { logout } from "@/lib/actions/auth";

const SESSION_STORAGE_KEY = "wedora_session_active";
const BROADCAST_CHANNEL_NAME = "wedora_session_sync";

export function SessionLifecycle() {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      } catch {
        channel = null;
      }
    }

    // Helper untuk logout & kembali ke form login
    const triggerExitLogout = async () => {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        if (channel) {
          channel.postMessage({ type: "LOGOUT" });
        }
        await logout();
        const { createClient } = await import("@/lib/supabase/client");
        await createClient().auth.signOut();
      } catch (err) {
        console.error("Gagal membersihkan sesi:", err);
      } finally {
        window.location.href = "/login";
      }
    };

    // Dengarkan pesan sinkronisasi antar tab yang sedang dibuka
    if (channel) {
      channel.onmessage = (event) => {
        const { type } = event.data || {};
        if (type === "PING") {
          // Tab ini membalas jika sedang memegang sesi aktif
          if (sessionStorage.getItem(SESSION_STORAGE_KEY) === "true") {
            channel?.postMessage({ type: "PONG" });
          }
        } else if (type === "PONG") {
          // Konfirmasi diterima dari tab lain yang aktif
          sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        } else if (type === "LOGOUT") {
          // Tab lain mengakhiri sesi, tab ini juga keluar
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          window.location.href = "/login";
        }
      };
    }

    // Cek apakah tab saat ini sudah memegang sesi aktif
    const currentSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (currentSession === "true") {
      return () => {
        if (channel) channel.close();
      };
    }

    // Jika sessionStorage kosong (artinya website baru saja dibuka kembali setelah sebelumnya ditutup/keluar):
    // Verifikasi apakah masih ada tab Wedora lain yang sedang aktif
    let isConfirmedByOtherTab = false;

    const onPongReceived = (event: MessageEvent) => {
      if (event.data?.type === "PONG") {
        isConfirmedByOtherTab = true;
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      }
    };

    if (channel) {
      channel.addEventListener("message", onPongReceived);
      channel.postMessage({ type: "PING" });
    }

    // Jeda 150ms untuk menunggu respons tab lain
    const timer = setTimeout(() => {
      if (!isConfirmedByOtherTab && sessionStorage.getItem(SESSION_STORAGE_KEY) !== "true") {
        // Tidak ada tab yang merespons -> Pengguna sudah keluar dari website sebelumnya
        // Sistem meminta admin untuk login kembali
        triggerExitLogout();
      }
      if (channel) {
        channel.removeEventListener("message", onPongReceived);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (channel) {
        channel.removeEventListener("message", onPongReceived);
        channel.close();
      }
    };
  }, []);

  return null;
}
