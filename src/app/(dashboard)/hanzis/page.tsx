/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/radicals/page.tsx
"use client";
import { useEffect, useState } from "react";

import HanzisTable from "./_components/HanzisTable";
import { Hanzi } from "./_components/types";
import { AddHanziButton } from "./_components/AddHanziButton";
import { getHanzis } from "@/app/actions/hanzi-actions";

export default function HanzisPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hanzisData, setHanzisData] = useState<{
    hanzis: Hanzi[];
    total: number;
  }>({ hanzis: [], total: 0 });

  // Fetch hanzis with pagination
  const fetchHanzis = async () => {
    const result = await getHanzis({ page, limit });
    if (result.data) {
      setHanzisData({
        hanzis: result.data,
        total: result.total
      });
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchHanzis();
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  if (!hanzisData) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hanzis</h1>
          <AddHanziButton />
        </div>
        {/* <p className="text-red-500">{error || "Failed to load radicals"}</p> */}
      </div>
    );
  }

  console.log("hanzisData: ", hanzisData);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hanzis</h1>
        <AddHanziButton />
      </div>

      <HanzisTable
        hanzis={hanzisData.hanzis}
        totalCount={hanzisData.total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}
