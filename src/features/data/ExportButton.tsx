"use client";

import { useState, useTransition } from "react";
import type { ExportsAllData } from "./export-all-data";
import { exportAllData } from "./export-all-data";
import { cleanupReservationsAction } from "./cleanup-reservations.action";

type Props = {
  data: ExportsAllData;
  month: string;
};

export default function ExportButton({ data, month }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    setError("");

    startTransition(async () => {
      try {
        const result = await cleanupReservationsAction(month, password);

        exportAllData(data);

        setOpen(false);
        setPassword("");

        alert(
          `Export berjaya. ${result.deletedCount} rekod tempahan telah dipadam.`,
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Export gagal. Sila cuba lagi.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPassword("");
          setError("");
          setOpen(true);
        }}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Export Data
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              setOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="export-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              Export Data Tempahan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Masukkan kata laluan untuk mengeksport dan memadam rekod tempahan
              bagi bulan yang dipilih.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleExport();
              }}
            >
              <div>
                <label
                  htmlFor="export-password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Kata laluan
                </label>

                <input
                  id="export-password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isPending}
                  placeholder="Masukkan kata laluan"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isPending || !password.trim()}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Export & Padam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
