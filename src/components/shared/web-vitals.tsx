"use client";

import { useReportWebVitals } from "next/web-vitals";

const reportWebVitals: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  console.log(metric);
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}
