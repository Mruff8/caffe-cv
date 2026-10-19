import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import { buatKlienSesiAdmin, buatKlienServer } from "@/lib/supabase/server";
import FormUbahProduk from "./FormUbahProduk";

export const dynamic = "force-dynamic";

// US-09: form ubah produk terisi data lama dari database dan menyimpan perubahan
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  let produk = null;
  try {
    const supabase = await buatKlienSesiAdmin();
    let { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && process.env.SUPABASE_SECRET_KEY) {
      const klienServer = buatKlienServer();
      const res = await klienServer
        .from("produk")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!res.error && res.data) {
        data = res.data;
      }
    }

    produk = data;
  } catch {
    // Abaikan dan panggil notFound jika query gagal
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormUbahProduk produk={produk} />
    </div>
  );
}
