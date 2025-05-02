// app/radicals/page.tsx
"use client";
import { useEffect, useState } from "react";
import { RadicalsTable } from "./_components/RadicalsTable";
import { AddRadicalButton } from "./_components/AddRadicalButton";
import { getRadicals } from "@/app/actions/radicals-actions";
import { Radical } from "./_components/types";

export default function RadicalsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [radicalsData, setRadicalsData] = useState<{
    radicals: Radical[];
    total: number;
  }>({ radicals: [], total: 0 });

  // Fetch radicals with pagination
  const fetchRadicals = async () => {
    const result = await getRadicals({ page, limit });
    if (result.data) {
      setRadicalsData({
        radicals: result.data,
        total: result.total || result.data.length
      });
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchRadicals();
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  if (!radicalsData) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Radicals</h1>
          <AddRadicalButton />
        </div>
        <p className="text-red-500">Failed to load radicals</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Radicals</h1>
        <AddRadicalButton />
      </div>

      <RadicalsTable
        radicals={radicalsData.radicals}
        totalCount={radicalsData.total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}