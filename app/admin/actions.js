"use server";

import { redirect } from "next/navigation";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 */
export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data.get("email");
  const password = data.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let authError;
  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });
    authError = error;
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghubungi server autentikasi." };
  }

  if (authError) {
    return {
      error:
        authError.message === "Invalid login credentials"
          ? "Email atau password salah."
          : authError.message || "Gagal masuk. Silakan periksa kembali email dan password.",
    };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke halaman login.
 */
export async function keluar() {
  try {
    const supabase = await buatKlienSesiAdmin();
    await supabase.auth.signOut();
  } catch {
    // Tetap lanjutkan pengalihan jika ada error saat sign out
  }

  redirect("/admin/login");
}

export const logout = keluar;

