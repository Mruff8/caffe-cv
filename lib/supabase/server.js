import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat klien Supabase untuk server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (seperti katalog dan detail produk)
 * yang melewati RLS di sisi server.
 */
export function buatKlienServer() {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Membuat klien Supabase untuk sesi admin menggunakan @supabase/ssr dan cookie.
 * Menggunakan SUPABASE_PUBLISHABLE_KEY untuk autentikasi dan operasi data dengan RLS.
 */
export async function buatKlienSesiAdmin() {
  const cookieStore = await cookies();
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component saat render, abaikan error set cookie
        }
      },
    },
  });
}

export const buatKlienAdmin = buatKlienSesiAdmin;
export default buatKlienServer;
