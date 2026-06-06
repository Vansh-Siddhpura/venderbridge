import React from 'react';

export interface ColumnDef {
  header: string;
  accessorKey?: string;
  cell?: (row: any) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
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
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  isLoading,
  pagination,
  onRowClick,
  emptyMessage = 'No records found.',
}: DataTableProps) {
  const alignClass = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="data-table">
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={alignClass(col.align)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx}>
                      <div className="skeleton h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id ?? rIdx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'data-table__row--clickable' : ''}
                >
                  {columns.map((col, cIdx) => {
                    const value = col.accessorKey ? row[col.accessorKey] : undefined;
                    return (
                      <td key={cIdx} className={alignClass(col.align)}>
                        {col.cell ? col.cell(row) : value !== undefined && value !== null ? String(value) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="data-table__pagination">
          <div>
            Page <span className="font-medium text-primary">{pagination.page}</span> of {pagination.totalPages}
            <span className="ml-2 text-subtle">({pagination.total} results)</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => pagination.onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn btn--secondary btn--sm"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="btn btn--secondary btn--sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
