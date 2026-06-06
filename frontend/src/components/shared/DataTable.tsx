interface DataTableProps {
  children?: React.ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return <div className="data-table">{children || 'DataTable'}</div>;
}
