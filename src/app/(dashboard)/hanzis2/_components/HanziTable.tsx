/* eslint-disable @typescript-eslint/no-unused-vars */
// app/hanzis/_components/HanziTable.tsx
"use client";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender, SortingState } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
// import type { Hanzi } from "./types";
import { useState } from "react";
import { deleteHanzi } from "@/app/actions/hanzi-actions";

interface Hanzi {
  id: number;
  standard_character: string;
  traditional_character: string | null;
  is_identical: boolean;
  pinyin: { pronunciation: string }[];
  definition: string;
  stroke_count: number;
  hsk_level: number;
  frequency_rank?: number | null;
  standard_radical_ids: { id: number }[];
  traditional_radical_ids: { id: number }[] | null;
}

interface HanziTableProps {
  hanzis: Hanzi[];
}

export function HanziTable({ hanzis }: HanziTableProps) {
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
      accessorKey: "character_type",
      header: "Type",
      cell: ({ row }) => row.original.is_identical ? "Identical" : 
                        row.original.traditional_character ? "Simplified" : "Traditional",
    },
    {
      accessorKey: "pinyin",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Pinyin
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.pinyin.map(p => p.pronunciation).join(", "),
      sortingFn: (a, b) => {
        const aPinyin = a.original.pinyin.map(p => p.pronunciation).join("");
        const bPinyin = b.original.pinyin.map(p => p.pronunciation).join("");
        return aPinyin.localeCompare(bPinyin);
      },
    },
    {
      accessorKey: "definition",
      header: "Definition",
    },
    {
      accessorKey: "stroke_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Strokes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "hsk_level",
      header: "HSK",
      cell: ({ row }) => `HSK ${row.original.hsk_level}`,
    },
    {
      accessorKey: "frequency_rank",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Frequency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.frequency_rank || "-",
    },
    {
      accessorKey: "radicals",
      header: "Radicals",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.standard_radical_ids?.map((radical, index) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
              {radical.id}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            // onClick={() => openDialog?.(row.original)}
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
            className="h-8 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    }
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
                  {flexRender(header.column.columnDef.header, header.getContext())}
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