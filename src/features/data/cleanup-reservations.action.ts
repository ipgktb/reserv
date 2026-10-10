"use server";

import "server-only";

import { cleanupReservationsByMonth } from "./cleanup-reservations.repository";

export async function cleanupReservationsAction(
  month: string,
  password: string,
) {
  const exportPassword = process.env.RESERVATION_EXPORT_PASSWORD;

  if (!exportPassword) {
    throw new Error("Export password is not configured.");
  }

  if (password !== exportPassword) {
    throw new Error("Kata laluan tidak sah.");
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Bulan tidak sah.");
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  if (month >= currentMonth) {
    throw new Error("Hanya tempahan bulan terdahulu boleh dipadam.");
  }

  return cleanupReservationsByMonth(month);
}
