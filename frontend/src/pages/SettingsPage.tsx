import { useState } from 'react';
import { Badge, Icon, Switch } from '@/components/ui';

const AI_TOGGLES = [
  { id: 'auto-create', title: 'Авто-создание заявок из чатов', sub: 'ИИ читает сообщения и открывает тикеты' },
  { id: 'auto-escalate', title: 'Авто-эскалация аварийных', sub: 'Мгновенный перевод на дежурную бригаду' },
  { id: 'notify', title: 'Уведомления жителям о статусе', sub: 'Авто-сообщения при смене статуса заявки' },
];

const INTEGRATIONS = [
  { id: 'tg', name: 'Telegram', sub: '4 чата подключено', icon: 'IconChatCircleDots', connected: true },
  { id: 'max', name: 'MAX Messenger', sub: '2 сообщества', icon: 'IconChatsTeardrop', connected: true },
  { id: 'web', name: 'Виджет на сайте', sub: 'Форма обращений', icon: 'IconGlobe', connected: true },
] as const;

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'auto-create': true,
    'auto-escalate': true,
    notify: true,
  });

  return (
    <div className="settings-layout">
      <div className="hd-card">
        <div className="settings-head">
          <span className="settings-head__icon">
            <Icon name="IconRobot" size={17} color="#fff" />
          </span>
          <h3 className="hd-h3">ИИ-ассистент</h3>
        </div>
        {AI_TOGGLES.map((row, i) => (
          <div key={row.id} className="settings-row" data-last={i === AI_TOGGLES.length - 1}>
            <div>
              <div className="settings-row__title">{row.title}</div>
              <div className="settings-row__sub">{row.sub}</div>
            </div>
            <Switch
              checked={toggles[row.id]}
              onChange={(v) => setToggles((prev) => ({ ...prev, [row.id]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="hd-card">
        <h3 className="hd-h3 card-title">Интеграции</h3>
        {INTEGRATIONS.map((it, i) => (
          <div key={it.id} className="settings-row" data-last={i === INTEGRATIONS.length - 1}>
            <div className="settings-integration">
              <span className="settings-integration__icon">
                <Icon name={it.icon} size={18} />
              </span>
              <div>
                <div className="settings-row__title">{it.name}</div>
                <div className="settings-row__sub">{it.sub}</div>
              </div>
            </div>
            <Badge color="success" size="sm">
              Подключено
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
