"use client";

import { useActionState } from "react";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";

// US-08: form tambah produk baru terhubung langsung ke database.
export default function HalamanTambahProduk() {
  const [state, formAction, isPending] = useActionState(tambahProduk, null);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk
        action={formAction}
        error={state?.error}
        labelTombol={isPending ? "Menyimpan..." : "Simpan produk"}
      />
    </div>
  );
}
