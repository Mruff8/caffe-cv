"use server";

import { redirect } from "next/navigation";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";

/**
 * Memeriksa apakah admin saat ini sedang login di server.
 * Mengembalikan objek user jika valid, atau null jika tidak login.
 */
export async function periksaLoginAdmin() {
  try {
    const supabase = await buatKlienSesiAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

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
 * Server Action untuk mengganti password admin yang sedang login.
 * Memeriksa login di server terlebih dahulu sebelum melakukan perubahan data.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data.get("password_baru");
  const konfirmasiPassword = data.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  // Wajib periksa login di server sebelum mengubah data (aturan keamanan no. 3)
  const user = await periksaLoginAdmin();
  if (!user) {
    return { error: "Sesi login tidak ditemukan atau kedaluwarsa. Silakan masuk kembali." };
  }

  let supabase;
  try {
    supabase = await buatKlienSesiAdmin();
  } catch (err) {
    return { error: err.message || "Gagal menginisialisasi sesi." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: "Password berhasil diganti." };
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
