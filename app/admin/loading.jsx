import NavAdmin from "@/components/NavAdmin";

export default function LoadingAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-permukaan" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-garis">
        <div className="flex flex-col gap-3 p-6">
          <div className="h-8 w-full animate-pulse rounded bg-permukaan" />
          <div className="h-12 w-full animate-pulse rounded bg-permukaan" />
          <div className="h-12 w-full animate-pulse rounded bg-permukaan" />
          <div className="h-12 w-full animate-pulse rounded bg-permukaan" />
        </div>
      </div>
    </div>
  );
}

