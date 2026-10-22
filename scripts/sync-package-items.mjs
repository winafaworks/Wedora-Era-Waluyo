import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function dbGet(endpoint) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GET ${endpoint} failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function dbPost(endpoint, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST ${endpoint} failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function dbDelete(endpoint) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DELETE ${endpoint} failed (${res.status}): ${err}`);
  }
  return true;
}

const DEFAULT_PACKAGE_TEMPLATES = {
  gedung2: [
    "[Decoration] Dekorasi pelaminan (max 10-12 meter)",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Meja & kursi akad",
    "[Decoration] Dekorasi jalan",
    "[Decoration] Karpet jalan",
    "[Decoration] Gazebo + akrilik",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Dekorasi terima tamu",
    "[Decoration] Wedding gate",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Dekorasi mobil pengantin",
    "[Decoration] Artificial flowers bouquet (for rent)",
    "[Decoration] Janur dan kembar mayang",
  ],
  gedung1: [
    "[Decoration] Dekorasi pelaminan (max 10 meter)",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Meja & kursi akad",
    "[Decoration] Dekorasi jalan",
    "[Decoration] Karpet jalan",
    "[Decoration] Gazebo",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Dekorasi terima tamu",
    "[Decoration] Wedding gate",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Artificial flowers bouquet (for rent)",
    "[Decoration] Janur dan kembar mayang",
  ],
  rumah2: [
    "[Decoration] Dekorasi pelaminan (max 8 meter)",
    "[Decoration] Meja dan kursi akad",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Wedding gate",
    "[Decoration] Dekorasi kamar",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Artificial flowers bouquet ( for rent )",
    "[Decoration] Janur dan kembar mayang",
  ],
  rumah1: [
    "[Decoration] Dekorasi pelaminan (max 6 meter)",
    "[Decoration] Meja dan kursi akad",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Wedding gate",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Artificial flowers bouquet ( for rent )",
    "[Decoration] Janur dan kembar mayang",
  ],
  siraman: [
    "[Decoration] Dekorasi siraman",
    "[Adat Siraman] Peralatan Siraman",
  ],
  mua: [
    "[Peralatan & Aksesoris] Aksessoris akad & resepsi",
  ],
};

function getTemplateKey(packageName) {
  if (!packageName) return "default";
  const name = packageName.toLowerCase();
  if (name.includes("siraman")) return "siraman";
  if (name.includes("mua")) return "mua";
  if (name.includes("gedung 2") || name.includes("gedung ii")) return "gedung2";
  if (name.includes("gedung")) return "gedung1";
  if (name.includes("rumah 2") || name.includes("rumah ii")) return "rumah2";
  if (name.includes("rumah")) return "rumah1";
  return "default";
}

async function main() {
  console.log("=== SINKRONISASI MASTER BARANG PAKET ERA WALUYO ===");
  
  // 1. Ambil paket
  const pkgs = await dbGet("packages?select=id,nama,harga_dasar");
  console.log(`Ditemukan ${pkgs.length} paket di database.`);
  
  for (const pkg of pkgs) {
    const key = getTemplateKey(pkg.nama);
    const items = DEFAULT_PACKAGE_TEMPLATES[key];
    if (!items) {
      console.log(`Lewati ${pkg.nama} (tidak ada template khusus).`);
      continue;
    }
    
    // Hapus checklist_templates lama untuk paket ini
    await dbDelete(`checklist_templates?package_id=eq.${pkg.id}`);
    
    // Insert ulang
    const toInsert = items.map((nama) => ({
      package_id: pkg.id,
      nama_barang: nama,
    }));
    
    await dbPost("checklist_templates", toInsert);
    console.log(`✓ Master Template "${pkg.nama}": ${items.length} barang fix berhasil disimpan.`);
  }

  // 2. Sinkronkan ke checklist_items untuk semua booking yang ada
  console.log("\n=== SINKRONISASI BARANG ACARA (BOOKINGS) ===");
  const bookings = await dbGet("bookings?select=id,nama_pelanggan,package_id,packages(nama)");

  for (const b of bookings) {
    if (!b.package_id) continue;
    const pkgName = b.packages?.nama || "";
    const key = getTemplateKey(pkgName);
    const items = DEFAULT_PACKAGE_TEMPLATES[key];
    if (!items || items.length === 0) continue;

    // Reset dan isi ulang checklist_items dengan barang fix paket
    await dbDelete(`checklist_items?booking_id=eq.${b.id}`);
    
    const itemsToInsert = items.map((nama) => ({
      booking_id: b.id,
      nama_barang: nama,
      dimuat: false,
      kembali: false,
    }));
    
    await dbPost("checklist_items", itemsToInsert);
    console.log(`✓ Acara "${b.nama_pelanggan}" (${pkgName}): ${items.length} barang acara otomatis terisi.`);
  }

  console.log("\nSemua barang fix per paket berhasil disinkronkan ke master dan ke acara!");
}

main().catch(console.error);
