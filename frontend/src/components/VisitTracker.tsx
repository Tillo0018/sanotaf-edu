"use client";

import { useEffect } from "react";
import { fetchApi } from "@/lib/api";

export default function VisitTracker() {
  useEffect(() => {
    // Only track once per session
    if (!sessionStorage.getItem("visit_tracked")) {
      fetchApi("/statistics/visit", { method: "POST" })
        .then(() => {
          sessionStorage.setItem("visit_tracked", "true");
        })
        .catch((err) => {
          console.error("Failed to track visit", err);
        });
    }
  }, []);

  return null;
}
