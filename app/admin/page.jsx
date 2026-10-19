import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKlienSesiAdmin, buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-07: daftar produk diambil langsung dari database Supabase
export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesan = params?.pesan;

  let daftarProduk = [];
  let errorPesan = null;

  try {
    const supabase = await buatKlienSesiAdmin();
    let { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    // Fallback ke buatKlienServer jika koneksi sesi membutuhkan kunci service role di server
    if (error && process.env.SUPABASE_SECRET_KEY) {
      const klienServer = buatKlienServer();
      const res = await klienServer
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (!res.error) {
        data = res.data;
        error = null;
      }
    }

    if (error) {
      errorPesan = error.message;
    } else {
      daftarProduk = data ?? [];
    }
  } catch (err) {
    errorPesan = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesan === "sukses_tambah" && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm font-medium text-utama">
          Produk baru berhasil ditambahkan.
        </div>
      )}

      {pesan === "sukses_ubah" && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm font-medium text-utama">
          Perubahan produk berhasil disimpan.
        </div>
      )}

      {pesan === "sukses_hapus" && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm font-medium text-utama">
          Produk berhasil dihapus.
        </div>
      )}

      {errorPesan ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm text-teks-lembut">{errorPesan}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-garis bg-permukaan p-8 text-center text-teks-lembut">
          Belum ada produk tersimpan.
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
