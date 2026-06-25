import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Avatar, Badge, Button, Icon, SearchInput } from '@/components/ui';
import { useAdminStore } from '@/store/admin.store';
import { generatePassword } from '@/utils/password';
import type { Company } from '@/services/admin.service';

interface Credentials {
  email: string;
  password: string;
  company: string;
}
type DialogMode = 'create' | 'edit';

const emptyForm = {
  name: '',
  inn: '',
  address: '',
  phone: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

export default function AdminPage() {
  const { companies, fetch, create, update, remove } = useAdminStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const stats = useMemo(
    () => ({
      total: companies.length,
      active: companies.filter((c) => c.isActive).length,
      users: companies.reduce((sum, c) => sum + c.usersCount, 0),
    }),
    [companies],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      `${c.name} ${c.adminEmail ?? ''} ${c.inn ?? ''}`.toLowerCase().includes(q),
    );
  }, [companies, search]);

  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    setDialogMode('create');
    setEditingCompany(null);
    setForm({ ...emptyForm, adminPassword: generatePassword() });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (company: Company) => {
    setDialogMode('edit');
    setEditingCompany(company);
    setForm({
      name: company.name,
      inn: company.inn ?? '',
      address: company.address ?? '',
      phone: company.phone ?? '',
      adminName: company.adminName ?? '',
      adminEmail: company.adminEmail ?? '',
      adminPassword: '',
    });
    setError(null);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (form.name.trim().length < 2) return setError('Введите название компании');
    if (form.adminName.trim().length < 2) return setError('Введите имя администратора');
    if (!/^\S+@\S+\.\S+$/.test(form.adminEmail)) return setError('Введите корректный логин администратора (email)');
    if (dialogMode === 'create' && form.adminPassword.length < 6) return setError('Пароль должен быть не короче 6 символов');
    setBusy(true);
    setError(null);
    try {
      if (dialogMode === 'create') {
        await create({
          name: form.name.trim(),
          inn: form.inn.trim() || undefined,
          address: form.address.trim() || undefined,
          phone: form.phone.trim() || undefined,
          adminName: form.adminName.trim(),
          adminEmail: form.adminEmail.trim().toLowerCase(),
          adminPassword: form.adminPassword,
        });
        setCredentials({
          company: form.name.trim(),
          email: form.adminEmail.trim().toLowerCase(),
          password: form.adminPassword,
        });
      } else {
        if (!editingCompany) return;
        await update(editingCompany.id, {
          name: form.name.trim(),
          inn: form.inn.trim() || undefined,
          address: form.address.trim() || undefined,
          phone: form.phone.trim() || undefined,
          adminName: form.adminName.trim(),
          adminEmail: form.adminEmail.trim().toLowerCase(),
        });
      }
      setDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить компанию');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = (c: Company) => void update(c.id, { isActive: !c.isActive });

  const onDelete = async (c: Company) => {
    if (!window.confirm(`Удалить компанию «${c.name}» со всеми её данными?`)) return;
    await remove(c.id);
  };

  const copy = (text: string) => void navigator.clipboard?.writeText(text);

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Управляющие компании</h2>
          <p className="page-header__subtitle">Регистрация и доступы компаний</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Зарегистрировать компанию
        </Button>
      </div>

      <div className="kpi-grid admin-stats">
        <div className="kpi-card">
          <div className="kpi-card__head">
            <span className="kpi-card__label">Всего компаний</span>
            <span className="kpi-card__icon" style={{ background: 'var(--surface-brand-subtle)', color: 'var(--hd-blue-600)' }}>
              <Icon name="IconBuildings" size={19} />
            </span>
          </div>
          <div className="kpi-card__value">{stats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__head">
            <span className="kpi-card__label">Активных</span>
            <span className="kpi-card__icon" style={{ background: 'var(--status-success-bg)', color: 'var(--status-success-solid)' }}>
              <Icon name="IconCheckCircle" size={19} />
            </span>
          </div>
          <div className="kpi-card__value">{stats.active}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__head">
            <span className="kpi-card__label">Пользователей всего</span>
            <span className="kpi-card__icon" style={{ background: 'var(--status-info-bg)', color: 'var(--hd-blue-600)' }}>
              <Icon name="IconUsersThree" size={19} />
            </span>
          </div>
          <div className="kpi-card__value">{stats.users}</div>
        </div>
      </div>

      {credentials && (
        <div className="admin-banner">
          <div className="admin-banner__icon">
            <Icon name="IconCheckCircle" size={20} color="var(--status-success-solid)" />
          </div>
          <div className="admin-banner__body">
            <div className="admin-banner__title">
              Компания «{credentials.company}» создана. Передайте доступ управляющей компании:
            </div>
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
          <SearchInput placeholder="Поиск по названию, логину, ИНН…" value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="admin-users hd-card hd-card--flush">
        {filtered.length === 0 && <div className="empty-hint" style={{ padding: 20 }}>Компании не найдены</div>}
        {filtered.map((c) => (
          <div key={c.id} className="admin-user">
            <Avatar name={c.name} size="md" />
            <div className="admin-user__main">
              <div className="admin-user__name">{c.name}</div>
              <div className="admin-user__email">
                {c.adminEmail ?? '— без администратора'} · {c.usersCount} польз. · {c.requestsCount} заявок
              </div>
            </div>
            <div className="admin-user__badges">
              <Badge color={c.isActive ? 'success' : 'neutral'} size="sm">
                {c.isActive ? 'Активна' : 'Отключена'}
              </Badge>
            </div>
            <div className="admin-user__actions">
              <button className="hd-icon-btn" title="Редактировать" aria-label="Редактировать" onClick={() => openEdit(c)}>
                <Icon name="IconFileText" size={18} />
              </button>
              <button
                className="hd-icon-btn"
                title={c.isActive ? 'Отключить' : 'Включить'}
                aria-label="Переключить активность"
                onClick={() => toggleActive(c)}
              >
                <Icon name={c.isActive ? 'IconEye' : 'IconWarning'} size={18} />
              </button>
              <button className="hd-icon-btn" title="Удалить" aria-label="Удалить" onClick={() => void onDelete(c)}>
                <Icon name="IconTrash" size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        header={dialogMode === 'create' ? 'Регистрация управляющей компании' : 'Редактирование управляющей компании'}
        visible={dialogOpen}
        onHide={() => {
          setDialogOpen(false);
          setEditingCompany(null);
        }}
        className="new-request-dialog"
        style={{ width: '480px', maxWidth: '94vw' }}
        dismissableMask
      >
        <div className="new-request-form">
          <label className="new-request-form__field">
            <span>Название компании *</span>
            <InputText value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="УК «Альфа»" autoFocus />
          </label>
          <div className="new-request-form__row">
            <label className="new-request-form__field">
              <span>ИНН</span>
              <InputText value={form.inn} onChange={(e) => set('inn', e.target.value)} placeholder="7700000000" />
            </label>
            <label className="new-request-form__field">
              <span>Телефон</span>
              <InputText value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 …" />
            </label>
          </div>
          <label className="new-request-form__field">
            <span>Адрес</span>
            <InputText value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="г. Москва, …" />
          </label>

          <div className="admin-form__divider">Аккаунт администратора компании</div>

          <label className="new-request-form__field">
            <span>Имя администратора *</span>
            <InputText value={form.adminName} onChange={(e) => set('adminName', e.target.value)} placeholder="Иван Петров" />
          </label>
          <label className="new-request-form__field">
            <span>Логин (email) *</span>
            <InputText value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} placeholder="company@example.com" />
          </label>
          {dialogMode === 'create' && (
            <label className="new-request-form__field">
              <span>Пароль *</span>
              <div className="pwd-field">
                <InputText value={form.adminPassword} onChange={(e) => set('adminPassword', e.target.value)} />
                <button type="button" className="hd-icon-btn" title="Сгенерировать" onClick={() => set('adminPassword', generatePassword())}>
                  <Icon name="IconSparkle" size={18} />
                </button>
                <button type="button" className="hd-icon-btn" title="Скопировать" onClick={() => copy(form.adminPassword)}>
                  <Icon name="IconFileText" size={18} />
                </button>
              </div>
            </label>
          )}

          {error && <div className="new-request-form__error">{error}</div>}

          <div className="new-request-form__actions">
            <Button variant="ghost" type="button" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="button" onClick={submit} disabled={busy}>
              {busy ? 'Сохранение…' : dialogMode === 'create' ? 'Зарегистрировать' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
