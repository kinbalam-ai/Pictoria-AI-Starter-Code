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
}

export default function HanziTable({ hanzis }: HanziTableProps) {
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
      accessorKey: "stroke_count",
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
  });

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hanzis found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
