import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button, Icon } from '@/components/ui';
import { documentsService } from '@/services/documents.service';
import type { DocItem } from '@/types/document';

const TYPE_COLOR: Record<string, string> = {
  PDF: 'var(--hd-red-600)',
  XLSX: 'var(--hd-green-600)',
  XLS: 'var(--hd-green-600)',
  DOCX: 'var(--hd-blue-600)',
  DOC: 'var(--hd-blue-600)',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void documentsService.list().then(setDocs).catch(() => undefined);
  }, []);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const created = await documentsService.upload(file);
      setDocs((prev) => [created, ...prev]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (id: string) => {
    await documentsService.remove(id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Документы</h2>
          <p className="page-header__subtitle">{docs.length} файлов</p>
        </div>
        <input ref={fileRef} type="file" hidden onChange={onPick} />
        <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Загрузка…' : '+ Загрузить документ'}
        </Button>
      </div>

      <div className="docs-list hd-card hd-card--flush">
        {docs.length === 0 && (
          <div className="empty-hint" style={{ padding: 20 }}>
            Документов пока нет — загрузите первый.
          </div>
        )}
        {docs.map((doc) => (
          <div key={doc.id} className="docs-list__row">
            <span className="docs-list__icon" style={{ color: TYPE_COLOR[doc.type] ?? 'var(--text-secondary)' }}>
              <Icon name="IconFileText" size={20} />
            </span>
            <div className="docs-list__main">
              <div className="docs-list__name">{doc.name}</div>
              <div className="docs-list__meta">
                {doc.type} · {doc.sizeLabel} · {formatDate(doc.createdAt)}
              </div>
            </div>
            <button
              className="hd-icon-btn"
              aria-label="Скачать"
              title="Скачать"
              onClick={() => void documentsService.download(doc)}
            >
              <Icon name="IconDownload" size={18} />
            </button>
            <button className="hd-icon-btn" aria-label="Удалить" title="Удалить" onClick={() => void remove(doc.id)}>
              <Icon name="IconTrash" size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
