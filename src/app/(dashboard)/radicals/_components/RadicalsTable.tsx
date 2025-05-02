/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteRadical } from '@/app/actions/radicals-actions'
import useRadicalDialogStore from '@/store/useRadicalDialogStore'

export interface Radical {
  id: number
  forms: {
    variant: string
    strokes: number
  }[]
  pinyin: {
    pronunciation: string
  }[]
  kangxi_number: number
  name_en: string
  meaning: string
  hsk_level: number | null
}

interface RadicalsTableProps {
  radicals: Radical[];
  totalCount: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function RadicalsTable({ 
  radicals,
  totalCount,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: RadicalsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { openDialog } = useRadicalDialogStore();

  const onDelete = async (id: number) => {
    const result = await deleteRadical(id);
    if (!result.success) {
      throw new Error(result.error || "Failed to delete radical");
    }
  };

  const columns: ColumnDef<Radical>[] = [
    {
      accessorKey: 'forms',
      header: 'Variants',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.forms.map((form, i) => (
            <div key={i} className="font-medium">{form.variant}</div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'strokes',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-0"
        >
          Strokes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.forms.map((form, i) => (
            <div key={i}>{form.strokes}</div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'pinyin',
      header: 'Pronunciations',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.pinyin.map((p, i) => (
            <div key={i}>{p.pronunciation}</div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'kangxi_number',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-0"
        >
          Kangxi #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'hsk_level',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-0"
        >
          HSK Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.hsk_level ? `HSK ${row.original.hsk_level}` : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'name_en',
      header: 'English Name',
    },
    {
      accessorKey: 'meaning',
      header: 'Meaning',
    },
    {
      id: 'actions',
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
            onClick={async () => await onDelete(row.original.id)}
            className="h-8 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    }
  ]

  const table = useReactTable({
    data: radicals,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // We handle pagination server-side
  })

  return (
    <div className="space-y-4">
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
                  No radicals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls - matching HanziTable style */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-0">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[5, 10, 20, 30, 40, 50].map((size) => (
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
            {Math.min(page * limit, totalCount)} of {totalCount} radicals
          </p>
        </div>
      </div>
    </div>
  )
}