"use client";

import { useState, useTransition } from "react";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapusProduk({ id, nama }) {
  const [bukaModal, setBukaModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleHapus = () => {
    startTransition(async () => {
      await hapusProduk(id);
      setBukaModal(false);
    });
  };

  return (
    <>
      <Tombol
        type="button"
        varian="bahaya"
        onClick={() => setBukaModal(true)}
      >
        Hapus
      </Tombol>

      {bukaModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-garis bg-latar p-6 shadow-xl">
            <h3 className="text-lg font-bold text-teks">Hapus produk?</h3>
            <p className="mt-2 text-sm text-teks-lembut">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-teks">"{nama}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Tombol
                type="button"
                varian="garis"
                onClick={() => setBukaModal(false)}
                disabled={isPending}
              >
                Batal
              </Tombol>
              <Tombol
                type="button"
                varian="bahaya"
                onClick={handleHapus}
                disabled={isPending}
              >
                {isPending ? "Menghapus..." : "Ya, hapus"}
              </Tombol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

