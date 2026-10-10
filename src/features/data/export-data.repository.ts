import { createClient } from "@/lib/supabase/server";
import type { ExportsAllData } from "./export-all-data";

export async function getExportAllData(): Promise<ExportsAllData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservation_reports")
    .select("*")
    .order("booking_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch export data: ${error.message}`);
  }
  console.log("EXPORT COUNT:", data?.length);

  const reservations = (data ?? []).map((row) => ({
    id: row.id,
    booking_date: row.booking_date,
    room_name: row.room_name ?? "",
    room_label: row.room_label ?? null,
    start_time: row.start_time ?? "",
    end_time: row.end_time ?? "",
    full_name: row.full_name,
    user_role: row.user_role,
    capacity: row.capacity,
    project_type: row.project_type,
    project_progress: row.project_progress,
    status: row.status,
    cancel_reason: row.cancel_reason,
    created_at: row.created_at,
  }));

  return {
    reservations,

    summary: {
      total_reservations: reservations.length,
      confirmed_reservations: reservations.filter(
        (r) => r.status === "confirmed",
      ).length,
      cancelled_reservations: reservations.filter(
        (r) => r.status === "cancelled",
      ).length,
      total_students: reservations.filter((r) => r.user_role === "student")
        .length,
      total_teachers: reservations.filter((r) => r.user_role === "teacher")
        .length,
      total_capacity: reservations.reduce((total, r) => total + r.capacity, 0),
    },

    exported_at: new Date().toISOString(),
  };
}
