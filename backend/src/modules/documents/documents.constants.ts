import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** On-disk location for uploaded documents (created on first use). */
export const UPLOAD_DIR = join(process.cwd(), 'uploads');

export function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
