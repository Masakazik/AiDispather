import { InputSwitch } from 'primereact/inputswitch';

interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <InputSwitch checked={checked} onChange={(e) => onChange?.(e.value ?? false)} className="hd-switch" />
  );
}
