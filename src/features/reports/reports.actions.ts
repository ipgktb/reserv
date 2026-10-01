"use server";

import { getTodayReports, reportsRepository } from "./reports.repository";

export async function getReports() {
  const data = await reportsRepository.getAll();
  return data;
}

export async function getTodayBooking() {
  return getTodayReports();
}
