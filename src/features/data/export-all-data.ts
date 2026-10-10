export type ExportsAllData = {
  reservations: {
    id: string;
    booking_date: string;
    room_name: string;
    room_label: string | null;
    start_time: string;
    end_time: string;
    full_name: string;
    user_role: "student" | "teacher";
    capacity: number;
    project_type: string | null;
    project_progress: string | null;
    status: "confirmed" | "cancelled";
    cancel_reason: string | null;
    created_at: string;
  }[];

  summary: {
    total_reservations: number;
    confirmed_reservations: number;
    cancelled_reservations: number;
    total_students: number;
    total_teachers: number;
    total_capacity: number;
  };

  exported_at: string;
};

const escape = (value: unknown) => {
  if (value === null || value === undefined) return "";

  return `"${String(value).replace(/"/g, '""')}"`;
};

export function exportAllData(data: ExportsAllData) {
  const header = [
    "ID",
    "Tarikh",
    "Bilik",
    "Label Bilik",
    "Masa Mula",
    "Masa Tamat",
    "Nama",
    "Peranan",
    "Jumlah Peserta",
    "Jenis Projek",
    "Kemajuan Projek",
    "Status",
    "Sebab Pembatalan",
    "Tarikh Dibuat",
  ];

  const rows = data.reservations.map((r) =>
    [
      r.id,
      r.booking_date,
      r.room_name,
      r.room_label,
      r.start_time,
      r.end_time,
      r.full_name.toUpperCase(),
      r.user_role,
      r.capacity,
      r.project_type,
      r.project_progress,
      r.status,
      r.cancel_reason,
      r.created_at,
    ]
      .map(escape)
      .join(","),
  );

  const csvContent = [header.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `reservation-report-all-data-${date}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
