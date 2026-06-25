import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Avatar, Badge, Button, Icon, SearchInput, Select, type SelectOption } from '@/components/ui';
import { useStaffStore } from '@/store/staff.store';
import { useAuth } from '@/hooks/useAuth';
import { displayName } from '@/utils/format';
import { generatePassword } from '@/utils/password';
import type { StaffRole } from '@/services/staff.service';
import type { User } from '@/types/user';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Администратор',
  DISPATCHER: 'Диспетчер',
  TECHNICIAN: 'Исполнитель',
  RESIDENT: 'Житель',
};
const ROLE_OPTIONS: SelectOption[] = [
  { value: 'DISPATCHER', label: 'Диспетчер' },
  { value: 'TECHNICIAN', label: 'Исполнитель' },
];

interface Credentials {
  email: string;
  password: string;
  title: string;
}

const emptyForm = { name: '', email: '', password: '', role: 'TECHNICIAN' as StaffRole };
type DialogMode = 'create' | 'edit';

export default function StaffPage() {
  const { user: me } = useAuth();
  const { items, fetch, create, update, remove } = useStaffStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((u) => `${displayName(u)} ${u.email} ${ROLE_LABEL[u.role]}`.toLowerCase().includes(q));
  }, [items, search]);

  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    setDialogMode('create');
    setEditingUser(null);
    setForm({ ...emptyForm, password: generatePassword() });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setDialogMode('edit');
    setEditingUser(u);
    setForm({
      name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim(),
      email: u.email,
      password: '',
      role: (u.role === 'DISPATCHER' || u.role === 'TECHNICIAN' ? u.role : 'TECHNICIAN') as StaffRole,
    });
    setError(null);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (form.name.trim().length < 2) return setError('Введите имя сотрудника');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Введите корректный логин (email)');
    if (dialogMode === 'create' && form.password.length < 6) return setError('Пароль должен быть не короче 6 символов');
    setBusy(true);
    setError(null);
    try {
      if (dialogMode === 'create') {
        await create({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        });
        setCredentials({ email: form.email.trim().toLowerCase(), password: form.password, title: 'Сотрудник добавлен' });
      } else {
        if (!editingUser) return;
        await update(editingUser.id, {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
        });
      }
      setDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить сотрудника');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (u: User) => {
    const password = generatePassword();
    await update(u.id, { password });
    setCredentials({ email: u.email, password, title: 'Пароль сброшен' });
  };

  const toggleActive = (u: User) => void update(u.id, { isActive: !u.isActive });

  const onDelete = async (u: User) => {
    if (!window.confirm(`Удалить сотрудника ${displayName(u) || u.email}?`)) return;
    await remove(u.id);
  };

  const copy = (text: string) => void navigator.clipboard?.writeText(text);

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Сотрудники</h2>
          <p className="page-header__subtitle">{items.length} в команде · аккаунты с доступом</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Добавить сотрудника
        </Button>
      </div>

      {credentials && (
        <div className="admin-banner">
          <div className="admin-banner__icon">
            <Icon name="IconCheckCircle" size={20} color="var(--status-success-solid)" />
          </div>
          <div className="admin-banner__body">
            <div className="admin-banner__title">{credentials.title}. Передайте данные сотруднику:</div>
            <div className="admin-banner__creds">
              <code>Логин: {credentials.email}</code>
              <code>Пароль: {credentials.password}</code>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copy(`Логин: ${credentials.email}\nПароль: ${credentials.password}`)}
          >
            Скопировать
          </Button>
          <button className="hd-icon-btn" aria-label="Скрыть" onClick={() => setCredentials(null)}>
            <Icon name="IconX" size={18} />
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <SearchInput placeholder="Поиск по имени, логину, роли…" value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="admin-users hd-card hd-card--flush">
        {filtered.length === 0 && <div className="empty-hint" style={{ padding: 20 }}>Сотрудников пока нет</div>}
        {filtered.map((u) => {
          const name = displayName(u) || u.email;
          const isAdmin = u.role === 'ADMIN';
          return (
            <div key={u.id} className="admin-user">
              <Avatar name={name} size="md" />
              <div className="admin-user__main">
                <div className="admin-user__name">
                  {name}
                  {me?.id === u.id && <span className="admin-user__you">это вы</span>}
                </div>
                <div className="admin-user__email">{u.email}</div>
              </div>
              <div className="admin-user__badges">
                <Badge color={isAdmin ? 'brand' : 'neutral'} size="sm">
                  {ROLE_LABEL[u.role] ?? u.role}
                </Badge>
                <Badge color={u.isActive ? 'success' : 'neutral'} size="sm">
                  {u.isActive ? 'Активен' : 'Отключён'}
                </Badge>
              </div>
              <div className="admin-user__actions">
                <button className="hd-icon-btn" title="Редактировать" aria-label="Редактировать" onClick={() => openEdit(u)}>
                  <Icon name="IconFileText" size={18} />
                </button>
                <button className="hd-icon-btn" title="Сбросить пароль" aria-label="Сбросить пароль" onClick={() => void resetPassword(u)}>
                  <Icon name="IconKey" size={18} />
                </button>
                <button
                  className="hd-icon-btn"
                  title={u.isActive ? 'Отключить' : 'Включить'}
                  aria-label="Переключить активность"
                  disabled={me?.id === u.id}
                  onClick={() => toggleActive(u)}
                >
                  <Icon name={u.isActive ? 'IconEye' : 'IconWarning'} size={18} />
                </button>
                <button
                  className="hd-icon-btn"
                  title="Удалить"
                  aria-label="Удалить"
                  disabled={me?.id === u.id || isAdmin}
                  onClick={() => void onDelete(u)}
                >
                  <Icon name="IconTrash" size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        header={dialogMode === 'create' ? 'Новый сотрудник' : 'Редактирование сотрудника'}
        visible={dialogOpen}
        onHide={() => {
          setDialogOpen(false);
          setEditingUser(null);
        }}
        className="new-request-dialog"
        style={{ width: '460px', maxWidth: '94vw' }}
        dismissableMask
      >
        <div className="new-request-form">
          <label className="new-request-form__field">
            <span>Имя сотрудника *</span>
            <InputText value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Иван Петров" autoFocus />
          </label>
          <label className="new-request-form__field">
            <span>Логин (email) *</span>
            <InputText value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="staff@example.com" />
          </label>
          <div className="new-request-form__row">
            <label className="new-request-form__field">
              <span>Роль</span>
              <Select options={ROLE_OPTIONS} value={form.role} onChange={(v) => set('role', v as StaffRole)} />
            </label>
            {dialogMode === 'create' && (
              <label className="new-request-form__field">
                <span>Пароль *</span>
                <div className="pwd-field">
                  <InputText value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <button type="button" className="hd-icon-btn" title="Сгенерировать" onClick={() => set('password', generatePassword())}>
                    <Icon name="IconSparkle" size={18} />
                  </button>
                </div>
              </label>
            )}
          </div>

          {error && <div className="new-request-form__error">{error}</div>}

          <div className="new-request-form__actions">
            <Button variant="ghost" type="button" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="button" onClick={submit} disabled={busy}>
              {busy ? 'Сохранение…' : dialogMode === 'create' ? 'Добавить' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
