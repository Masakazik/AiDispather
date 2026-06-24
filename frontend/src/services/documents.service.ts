import { http } from './http';
import { config } from '@/constants/config';
import { tokenStorage } from './token-storage';
import type { DocItem } from '@/types/document';

export const documentsService = {
  async list(): Promise<DocItem[]> {
    const { data } = await http.get<DocItem[]>('/documents');
    return data;
  },

  async upload(file: File): Promise<DocItem> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await http.post<DocItem>('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/documents/${id}`);
  },

  /** Download a document via an authenticated blob request, then save it. */
  async download(doc: DocItem): Promise<void> {
    const res = await fetch(`${config.apiBaseUrl}/documents/${doc.id}/download`, {
      headers: { Authorization: `Bearer ${tokenStorage.get() ?? ''}` },
    });
    if (!res.ok) throw new Error('Не удалось скачать файл');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
