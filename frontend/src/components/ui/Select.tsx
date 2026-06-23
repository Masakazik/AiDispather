import { Dropdown } from 'primereact/dropdown';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Thin wrapper over PrimeReact Dropdown, themed to the design tokens. */
export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  return (
    <Dropdown
      value={value}
      options={options}
      optionLabel="label"
      optionValue="value"
      placeholder={placeholder}
      onChange={(e) => onChange(e.value)}
      className={`hd-select ${className ?? ''}`}
    />
  );
}
