import { getExportAllData } from "@/features/data/export-data.repository";
import ExportButton from "@/features/data/ExportButton";

export default async function PageData() {
  const data = await getExportAllData();

  // const monthlyData = Object.entries(
  //   data.reservations.reduce<Record<string, typeof data.reservations>>(
  //     (groups, reservation) => {
  //       const month = reservation.booking_date.slice(0, 7);

  //       if (!groups[month]) {
  //         groups[month] = [];
  //       }

  //       groups[month].push(reservation);

  //       return groups;
  //     },
  //     {},
  //   ),
  // ).sort(([a], [b]) => b.localeCompare(a));

  const currentMonth = new Date()
    .toLocaleDateString("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    })
    .slice(0, 7);

  const monthlyData = Object.entries(
    data.reservations.reduce<Record<string, typeof data.reservations>>(
      (groups, reservation) => {
        const month = reservation.booking_date.slice(0, 7);

        if (month >= currentMonth) return groups;

        (groups[month] ??= []).push(reservation);

        return groups;
      },
      {},
    ),
  ).sort(([a], [b]) => b.localeCompare(a));
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Data Tempahan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Muat turun laporan tempahan mengikut bulan.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {monthlyData.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Tiada data tempahan tersedia.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {monthlyData.map(([month, reservations]) => {
              const [year, monthNumber] = month.split("-");

              const monthLabel = new Intl.DateTimeFormat("ms-MY", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(
                new Date(Date.UTC(Number(year), Number(monthNumber) - 1, 1)),
              );

              const monthlyExportData = {
                ...data,
                reservations,
                summary: {
                  total_reservations: reservations.length,
                  confirmed_reservations: reservations.filter(
                    (r) => r.status === "confirmed",
                  ).length,
                  cancelled_reservations: reservations.filter(
                    (r) => r.status === "cancelled",
                  ).length,
                  total_students: reservations.filter(
                    (r) => r.user_role === "student",
                  ).length,
                  total_teachers: reservations.filter(
                    (r) => r.user_role === "teacher",
                  ).length,
                  total_capacity: reservations.reduce(
                    (total, r) => total + r.capacity,
                    0,
                  ),
                },
              };

              return (
                <div
                  key={month}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-medium text-slate-900">{monthLabel}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {reservations.length} rekod tempahan
                    </p>
                  </div>

                  <ExportButton data={monthlyExportData} month={month} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
