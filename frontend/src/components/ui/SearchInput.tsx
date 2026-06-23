import { Icon } from './Icon';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  shortcut?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({ value, placeholder = 'Поиск…', shortcut, onChange }: SearchInputProps) {
  return (
    <label className="hd-search">
      <span className="hd-search__icon">
        <Icon name="IconSearch" size={16} />
      </span>
      <input
        className="hd-search__input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {shortcut && <kbd className="hd-search__kbd">{shortcut}</kbd>}
    </label>
  );
}
