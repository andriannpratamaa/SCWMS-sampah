'use client'

import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, AlertCircle, Inbox } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T extends Record<string, any>> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => ReactNode
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  error?: string | null
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string) => void
  page?: number
  totalPages?: number
  total?: number
  onPageChange?: (page: number) => void
  onRetry?: () => void
  emptyMessage?: string
  actions?: (item: T) => ReactNode
  onRowClick?: (item: T) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  error,
  searchable,
  searchPlaceholder = 'Cari...',
  searchValue,
  onSearchChange,
  sortBy,
  sortOrder,
  onSort,
  page,
  totalPages,
  total,
  onPageChange,
  onRetry,
  emptyMessage = 'Tidak ada data',
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState('')

  const currentSearch = searchValue ?? localSearch
  const handleSearchChange = onSearchChange ?? setLocalSearch

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return <ChevronUp className="w-3 h-3 text-gray-300" />
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-green-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-green-600" />
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 font-medium mb-1">Gagal memuat data</p>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Coba Lagi
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                    col.className
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={String(item.id ?? index)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'hover:bg-green-50/50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    index % 2 === 1 && 'bg-gray-50/50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-sm text-gray-700', col.className)}>
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {page && totalPages && total !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{total}</span> data
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-gray-300">...</span>
                  )}
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    className="w-8 h-8 text-xs"
                    onClick={() => onPageChange?.(p)}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
