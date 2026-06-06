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
    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="input-group flex-1 max-w-md">
        <span className="input-group__icon">
          <Search size={16} />
        </span>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="input input--with-icon"
        />
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              onChange={(e) => onFilter(filter.key, e.target.value)}
              className="input"
              style={{ width: 'auto', minWidth: 160 }}
              defaultValue=""
            >
              <option value="">All {filter.label.toLowerCase()}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
