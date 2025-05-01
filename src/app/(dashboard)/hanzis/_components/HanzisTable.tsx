/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/hanzis/_components/HanziTable.tsx
"use client";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Hanzi } from "./types";
import useHanziDialogStore from "@/store/useHanziDialogStore";
import { deleteHanzi } from "@/app/actions/hanzi-actions";
// import { deleteHanzi } from "@/app/actions/hanzi-actions";

interface HanziTableProps {
  hanzis: Hanzi[];

  totalCount: number; // Add total count for pagination
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}
export default function HanziTable({
  hanzis,
  totalCount,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: HanziTableProps) {
  const { openDialog } = useHanziDialogStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  const onDelete = async (id: number) => {
    const result = await deleteHanzi(id);
    if (!result.success) {
      throw new Error(result.error || "Failed to delete radical");
    }
    // Next.js will automatically re-render the page
  };

  const columns: ColumnDef<Hanzi>[] = [
    {
      accessorKey: "standard_character",
      header: "Standard",
    },
    {
      accessorKey: "traditional_character",
      header: "Traditional",
      cell: ({ row }) => row.original.traditional_character || "-",
    },
    {
      accessorKey: "is_identical",
      header: "Identical",
      cell: ({ row }) => (row.original.is_identical ? "Yes" : "No"),
    },
    {
      accessorKey: "pinyin",
      header: "Pinyin",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.pinyin.map((p, i) => (
            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
              {p.pronunciation}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "definition",
      header: "Definition",
    },
    {
      accessorKey: "simplified_stroke_count",
      header: "Strokes",
    },
    {
      accessorKey: "traditional_stroke_count",
      header: "Strokes",
    },
    {
      accessorKey: "hsk_level",
      header: "HSK",
      cell: ({ row }) => `HSK ${row.original.hsk_level}`,
    },
    {
      accessorKey: "frequency_rank",
      header: "Frequency",
      cell: ({ row }) => row.original.frequency_rank || "-",
    },
    {
      accessorKey: "simplified_radical_ids",
      header: "Radicals",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.simplified_radical_ids?.map((radical, i) => (
            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
              {radical.kangxi_id}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => openDialog(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              if (onDelete) {
                await onDelete(row.original.id);
              }
            }}
            className="h-8 w-8 p-0 hover:bg-red-50" // Added hover effect
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: hanzis,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Enable pagination
    manualPagination: true, // We'll handle pagination server-side
    pageCount: Math.ceil(totalCount / limit), // Total page count
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hanzis found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-0">
            {/* <p className="text-sm font-medium">Rows per page</p> */}
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page * limit >= totalCount}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, totalCount)} of {totalCount} hanzis
          </p>
        </div>
      </div>
    </div>
  );
}
