import { Injectable, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { extname } from 'node:path';
import type { Document } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ensureUploadDir, humanSize } from './documents.constants';

@Injectable()
export class DocumentsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    ensureUploadDir();
  }

  findAll(companyId: string | null): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { companyId: companyId ?? undefined },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string | null): Promise<Document> {
    const doc = await this.prisma.document.findFirst({
      where: { id, companyId: companyId ?? undefined },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  createFromUpload(
    file: Express.Multer.File,
    companyId: string | null,
    displayName?: string,
  ): Promise<Document> {
    // Multer decodes the original filename as latin1; restore UTF-8 for Cyrillic.
    const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const name = displayName?.trim() || original;
    const type = extname(original).replace('.', '').toUpperCase() || 'FILE';
    return this.prisma.document.create({
      data: {
        name,
        type,
        sizeLabel: humanSize(file.size),
        mimeType: file.mimetype,
        storedPath: file.path,
        companyId,
      },
    });
  }

  async remove(id: string, companyId: string | null): Promise<void> {
    const doc = await this.findOne(id, companyId);
    if (existsSync(doc.storedPath)) {
      await unlink(doc.storedPath).catch(() => undefined);
    }
    await this.prisma.document.delete({ where: { id } });
  }
}
