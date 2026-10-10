import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function cleanupReservationsByMonth(month: string) {
  const supabase = await createClient();

  const [year, monthNumber] = month.split("-").map(Number);

  const startDate = `${month}-01`;

  const endDate = new Date(Date.UTC(year, monthNumber, 1))
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("reservations")
    .delete()
    .gte("booking_date", startDate)
    .lt("booking_date", endDate)
    .select("id");

  if (error) {
    throw new Error(`Failed to delete reservations: ${error.message}`);
  }

  return {
    deletedCount: data?.length ?? 0,
  };
}
