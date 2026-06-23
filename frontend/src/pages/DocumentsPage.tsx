import { Icon } from '@/components/ui';
import { DOCS } from '@/features/dispatch/data';

export default function DocumentsPage() {
  return (
    <div className="docs-list hd-card hd-card--flush">
      {DOCS.map((doc) => (
        <div key={doc.name} className="docs-list__row">
          <span className="docs-list__icon" style={{ color: doc.color }}>
            <Icon name="IconFileText" size={20} />
          </span>
          <div className="docs-list__main">
            <div className="docs-list__name">{doc.name}</div>
            <div className="docs-list__meta">
              {doc.type} · {doc.size} · {doc.date}
            </div>
          </div>
          <span className="docs-list__download">
            <Icon name="IconDownload" size={18} />
          </span>
        </div>
      ))}
    </div>
  );
}
