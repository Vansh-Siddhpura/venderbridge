import React from 'react';

export interface ColumnDef {
  header: string;
  accessorKey?: string;
  cell?: (row: any) => React.ReactNode;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

interface DataTableProps {
  columns: ColumnDef[];
  data: any[];
  isLoading: boolean;
  pagination?: Pagination;
  onRowClick?: (row: any) => void;
}

export function DataTable({
  columns,
  data,
  isLoading,
  pagination,
  onRowClick,
}: DataTableProps) {
  return (
    <div className="w-full bg-surface border border-default rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-elevated border-b border-default text-xs font-semibold uppercase tracking-wider text-muted">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 select-none">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-primary-light/40 transition-colors animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty Row
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`text-sm text-primary transition-colors hover:bg-primary-light/40 border-b border-default last:border-b-0 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, cIdx) => {
                    const value = col.accessorKey ? row[col.accessorKey] : undefined;
                    return (
                      <td key={cIdx} className="px-6 py-4 font-medium align-middle">
                        {col.cell ? col.cell(row) : value !== undefined ? String(value) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-elevated border-t border-default text-xs font-semibold text-muted">
          <div>
            Showing <span className="text-primary">{data.length}</span> of{' '}
            <span className="text-primary">{pagination.total}</span> records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded border border-default bg-surface hover:bg-primary-light text-primary transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded border border-default bg-surface hover:bg-primary-light text-primary transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
