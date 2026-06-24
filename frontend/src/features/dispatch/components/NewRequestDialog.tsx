import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button, Select, type SelectOption } from '@/components/ui';
import { useRequestsStore } from '@/store/requests.store';
import { useDispatchStore } from '@/store/dispatch.store';
import type { ApiRequestPriority } from '@/types/service-request';

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'LOW', label: 'Низкий' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'HIGH', label: 'Высокий' },
  { value: 'CRITICAL', label: 'Критический' },
];

interface NewRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY = {
  title: '',
  category: '',
  priority: 'MEDIUM' as ApiRequestPriority,
  description: '',
  residentName: '',
  residentPhone: '',
  apartmentLabel: '',
};

export function NewRequestDialog({ open, onClose }: NewRequestDialogProps) {
  const createManual = useRequestsStore((s) => s.createManual);
  const openTicket = useDispatchStore((s) => s.openTicket);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const close = () => {
    setForm(EMPTY);
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (form.title.trim().length < 3) {
      setError('Введите заголовок (минимум 3 символа)');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createManual({
        title: form.title.trim(),
        priority: form.priority,
        category: form.category.trim() || undefined,
        description: form.description.trim() || undefined,
        residentName: form.residentName.trim() || undefined,
        residentPhone: form.residentPhone.trim() || undefined,
        apartmentLabel: form.apartmentLabel.trim() || undefined,
      });
      close();
      openTicket(ticket.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать заявку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      header="Новая заявка"
      visible={open}
      onHide={close}
      className="new-request-dialog"
      style={{ width: '460px', maxWidth: '94vw' }}
      dismissableMask
    >
      <div className="new-request-form">
        <label className="new-request-form__field">
          <span>Заголовок *</span>
          <InputText
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Например: Не работает лифт в подъезде 2"
            autoFocus
          />
        </label>

        <div className="new-request-form__row">
          <label className="new-request-form__field">
            <span>Категория</span>
            <InputText
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Лифт, Сантехника…"
            />
          </label>
          <label className="new-request-form__field">
            <span>Приоритет</span>
            <Select
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(v) => set('priority', v as ApiRequestPriority)}
            />
          </label>
        </div>

        <label className="new-request-form__field">
          <span>Описание</span>
          <InputTextarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            autoResize
            placeholder="Подробности обращения"
          />
        </label>

        <div className="new-request-form__row">
          <label className="new-request-form__field">
            <span>Житель</span>
            <InputText
              value={form.residentName}
              onChange={(e) => set('residentName', e.target.value)}
              placeholder="ФИО"
            />
          </label>
          <label className="new-request-form__field">
            <span>Телефон</span>
            <InputText
              value={form.residentPhone}
              onChange={(e) => set('residentPhone', e.target.value)}
              placeholder="+7 …"
            />
          </label>
        </div>

        <label className="new-request-form__field">
          <span>Квартира / адрес</span>
          <InputText
            value={form.apartmentLabel}
            onChange={(e) => set('apartmentLabel', e.target.value)}
            placeholder="кв. 44"
          />
        </label>

        {error && <div className="new-request-form__error">{error}</div>}

        <div className="new-request-form__actions">
          <Button variant="ghost" onClick={close} type="button">
            Отмена
          </Button>
          <Button variant="primary" onClick={submit} disabled={submitting} type="button">
            {submitting ? 'Создание…' : 'Создать заявку'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
