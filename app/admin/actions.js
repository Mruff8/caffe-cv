"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
 * Server Action untuk menambah produk baru ke tabel "produk".
 * Memeriksa login admin di server sebelum menyimpan data.
 */
export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  // Wajib periksa login di server sebelum menambah data (aturan keamanan no. 3)
  const user = await periksaLoginAdmin();
  if (!user) {
    return { error: "Sesi login tidak ditemukan atau kedaluwarsa. Silakan masuk kembali." };
  }

  const nama = data.get("nama")?.toString().trim();
  const hargaRaw = data.get("harga");
  const kategori = data.get("kategori")?.toString().trim() || null;
  const fotoUrl = data.get("foto_url")?.toString().trim() || null;
  const deskripsi = data.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (hargaRaw === null || hargaRaw === undefined || hargaRaw === "") {
    return { error: "Harga produk wajib diisi." };
  }

  const harga = Number(hargaRaw);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka positif atau nol." };
  }

  let insertError;
  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga: Math.round(harga),
        kategori,
        foto_url: fotoUrl,
        deskripsi,
      },
    ]);
    insertError = error;
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk." };
  }

  if (insertError) {
    return { error: insertError.message || "Gagal menyimpan produk ke database." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?pesan=sukses_tambah");
}

/**
 * Server Action untuk memperbarui (mengubah) produk yang sudah ada di tabel "produk".
 * Memeriksa login admin di server sebelum menyimpan perubahan.
 */
export async function ubahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  // Wajib periksa login di server sebelum mengubah data (aturan keamanan no. 3)
  const user = await periksaLoginAdmin();
  if (!user) {
    return { error: "Sesi login tidak ditemukan atau kedaluwarsa. Silakan masuk kembali." };
  }

  const id = data.get("id");
  if (!id) {
    return { error: "ID produk tidak valid atau tidak ditemukan." };
  }

  const nama = data.get("nama")?.toString().trim();
  const hargaRaw = data.get("harga");
  const kategori = data.get("kategori")?.toString().trim() || null;
  const fotoUrl = data.get("foto_url")?.toString().trim() || null;
  const deskripsi = data.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (hargaRaw === null || hargaRaw === undefined || hargaRaw === "") {
    return { error: "Harga produk wajib diisi." };
  }

  const harga = Number(hargaRaw);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka positif atau nol." };
  }

  let updateError;
  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        harga: Math.round(harga),
        kategori,
        foto_url: fotoUrl,
        deskripsi,
      })
      .eq("id", id);
    updateError = error;
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat memperbarui produk." };
  }

  if (updateError) {
    return { error: updateError.message || "Gagal memperbarui produk di database." };
  }

  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/");
  redirect("/admin?pesan=sukses_ubah");
}

/**
 * Server Action untuk menghapus produk dari database.
 * Memeriksa login admin di server sebelum melakukan penghapusan data.
 */
export async function hapusProduk(idOrFormData) {
  let id;
  if (idOrFormData instanceof FormData) {
    id = idOrFormData.get("id");
  } else {
    id = idOrFormData;
  }

  if (!id) {
    return { error: "ID produk tidak valid atau tidak ditemukan." };
  }

  // Wajib periksa login di server sebelum menghapus data (aturan keamanan no. 3)
  const user = await periksaLoginAdmin();
  if (!user) {
    return { error: "Sesi login tidak ditemukan atau kedaluwarsa. Silakan masuk kembali." };
  }

  let deleteError;
  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.from("produk").delete().eq("id", id);
    deleteError = error;
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghapus produk." };
  }

  if (deleteError) {
    return { error: deleteError.message || "Gagal menghapus produk dari database." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?pesan=sukses_hapus");
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
