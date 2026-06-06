interface SearchFilterProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function SearchFilter({
  placeholder = 'Search...',
  value = '',
  onChange,
  children,
}: SearchFilterProps) {
  return (
    <div className="search-filter">
      <input
        type="text"
        className="search-filter__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {children}
    </div>
  );
}
