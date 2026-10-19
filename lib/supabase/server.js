import { createClient } from "@supabase/supabase-js";

/**
 * Membuat klien Supabase untuk server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (seperti katalog dan detail produk)
 * yang melewati RLS di sisi server.
 */
export function buatKlienServer() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

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

export default buatKlienServer;

