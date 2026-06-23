import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  width?: number;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Right-side slide-in drawer with backdrop, matching the design's animations. */
export function Drawer({ open, onClose, width = 480, header, footer, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="hd-drawer__backdrop" onClick={onClose}>
      <aside
        className="hd-drawer"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {header && <div className="hd-drawer__header">{header}</div>}
        <div className="hd-drawer__body">{children}</div>
        {footer && <div className="hd-drawer__footer">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}
