import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilter: (key: string, value: string) => void;
  filters: FilterConfig[];
  placeholder?: string;
}

export function SearchFilter({
  onSearch,
  onFilter,
  filters,
  placeholder = 'Search...',
}: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-md bg-surface border border-default text-primary placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
        />
      </div>

      {/* Dynamic Dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted whitespace-nowrap">
            {filter.label}:
          </span>
          <select
            onChange={(e) => onFilter(filter.key, e.target.value)}
            className="px-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary cursor-pointer min-w-[140px]"
          >
            <option value="">All</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
