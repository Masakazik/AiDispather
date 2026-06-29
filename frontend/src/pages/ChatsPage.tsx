import { useEffect, useMemo, useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Avatar, Badge, Button, Icon, SearchInput, Select, type SelectOption } from '@/components/ui';
import {
  maxChatsService,
  type MaxChatMessage,
  type MaxChatThread,
} from '@/services/max-chats.service';
import { onRealtimeEvent } from '@/services/realtime.service';

type ChatSort = 'latest' | 'building_asc' | 'building_desc';

const dateTime = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const shortTime = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

function buildingKey(thread: Pick<MaxChatThread, 'buildingId' | 'chatId'>): string {
  return thread.buildingId ?? `unbound:${thread.chatId}`;
}

export default function ChatsPage() {
  const [threads, setThreads] = useState<MaxChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [sort, setSort] = useState<ChatSort>('latest');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [replyTargetKey, setReplyTargetKey] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [replyToMessage, setReplyToMessage] = useState<MaxChatMessage | null>(null);

  const loadThreads = async (withLoading = true) => {
    if (withLoading) setLoading(true);
    try {
      const data = await maxChatsService.listThreads();
      setThreads(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить сообщения');
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void loadThreads();
    const offChats = onRealtimeEvent('chats.updated', () => {
      void loadThreads(false);
    });
    return () => offChats();
  }, []);

  const filteredThreads = useMemo<MaxChatThread[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = threads.filter((thread) => {
      if (buildingFilter !== 'all' && buildingKey(thread) !== buildingFilter) return false;
      if (!q) return true;
      const haystack = `${thread.buildingName} ${thread.chatLabel} ${thread.messages
        .slice(-6)
        .map((m) => m.text)
        .join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });

    return filtered.sort((a, b) => {
      if (sort === 'building_asc') return a.buildingName.localeCompare(b.buildingName, 'ru');
      if (sort === 'building_desc') return b.buildingName.localeCompare(a.buildingName, 'ru');
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
    });
  }, [threads, query, buildingFilter, sort]);

  useEffect(() => {
    if (!filteredThreads.length) {
      setSelectedChatId(null);
      return;
    }
    if (!selectedChatId || !filteredThreads.some((thread) => thread.id === selectedChatId)) {
      setSelectedChatId(filteredThreads[0].id);
    }
  }, [filteredThreads, selectedChatId]);

  const selected = useMemo(
    () => filteredThreads.find((thread) => thread.id === selectedChatId) ?? null,
    [filteredThreads, selectedChatId],
  );

  const buildingOptions: SelectOption[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const chat of threads) {
      const buildingId = buildingKey(chat);
      if (!map.has(buildingId)) {
        map.set(buildingId, chat.buildingName);
      }
    }
    return [
      { value: 'all', label: 'Все дома' },
      ...Array.from(map.entries())
        .sort((a, b) => a[1].localeCompare(b[1], 'ru'))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [threads]);

  const sortOptions: SelectOption[] = [
    { value: 'latest', label: 'Сначала активные' },
    { value: 'building_asc', label: 'Дом: А-Я' },
    { value: 'building_desc', label: 'Дом: Я-А' },
  ];

  const replyTargets = useMemo(() => {
    const byBuilding = new Map<string, MaxChatThread>();
    for (const thread of threads) {
      if (!thread.routable) continue;
      const key = buildingKey(thread);
      const existing = byBuilding.get(key);
      if (!existing) {
        byBuilding.set(key, thread);
        continue;
      }
      if (new Date(thread.lastAt).getTime() > new Date(existing.lastAt).getTime()) {
        byBuilding.set(key, thread);
      }
    }
    return Array.from(byBuilding.entries())
      .map(([key, thread]) => ({ key, thread }))
      .sort((a, b) => a.thread.buildingName.localeCompare(b.thread.buildingName, 'ru'));
  }, [threads]);

  const replyTargetOptions: SelectOption[] = useMemo(
    () => replyTargets.map((t) => ({ value: t.key, label: t.thread.buildingName })),
    [replyTargets],
  );

  const selectedReplyTarget = useMemo(
    () => replyTargets.find((t) => t.key === replyTargetKey)?.thread ?? null,
    [replyTargets, replyTargetKey],
  );

  useEffect(() => {
    if (!replyTargets.length) {
      setReplyTargetKey('');
      return;
    }
    if (selected?.routable) {
      const key = buildingKey(selected);
      if (replyTargets.some((t) => t.key === key)) {
        setReplyTargetKey(key);
        return;
      }
    }
    if (!replyTargetKey || !replyTargets.some((t) => t.key === replyTargetKey)) {
      setReplyTargetKey(replyTargets[0].key);
    }
  }, [selected, replyTargets, replyTargetKey]);

  const sendReply = async () => {
    if (!selectedReplyTarget || replyText.trim().length < 2) return;
    setSendingReply(true);
    setError(null);
    try {
      const text = replyText.trim();
      const targetChatId = replyToMessage?.chatId ?? selectedReplyTarget.id;
      await maxChatsService.reply(targetChatId, text);
      setReplyText('');
      setReplyToMessage(null);
      setInfo(`Сообщение отправлено в ${selectedReplyTarget.buildingName}`);
      await loadThreads(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить сообщение');
    } finally {
      setSendingReply(false);
    }
  };

  const sendBroadcast = async () => {
    if (broadcastText.trim().length < 2) return;
    const target =
      buildingFilter === 'all'
        ? filteredThreads.filter((thread) => thread.routable)
        : filteredThreads.filter((thread) => thread.buildingId === buildingFilter && thread.routable);
    if (!target.length) return;

    setSendingBroadcast(true);
    setError(null);
    try {
      const text = broadcastText.trim();
      const res = await maxChatsService.broadcast(
        target.map((thread) => thread.id),
        text,
      );
      setBroadcastText('');
      if (res.failed > 0) {
        setInfo(`Рассылка частично отправлена: ${res.sent}/${res.total}`);
      } else {
        setInfo(`Рассылка отправлена в ${res.sent} чат(а/ов)`);
      }
      await loadThreads(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить рассылку');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const deleteMessage = async (message: MaxChatMessage) => {
    if (!message.messageId) {
      setError('У этого сообщения нет messageId MAX: удалить через API нельзя');
      return;
    }
    setDeletingMessageId(message.id);
    setError(null);
    try {
      await maxChatsService.deleteMessage(message.chatId, message.messageId);
      setInfo('Сообщение удалено');
      await loadThreads(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить сообщение');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const toggleMessageExpanded = (messageId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const selectMessageForReply = (message: MaxChatMessage) => {
    setReplyToMessage(message);
    setReplyTargetKey(buildingKey({ buildingId: message.buildingId, chatId: message.chatId }));
    if (!replyText.trim()) {
      setReplyText(`${message.author}, `);
    }
  };

  return (
    <div className="page chats-page">
      <div className="chats-toolbar">
        <div className="chats-toolbar__search">
          <SearchInput
            placeholder="Поиск по дому, чату или тексту сообщения…"
            value={query}
            onChange={setQuery}
          />
        </div>
        <div className="chats-toolbar__select">
          <Select options={buildingOptions} value={buildingFilter} onChange={setBuildingFilter} />
        </div>
        <div className="chats-toolbar__select">
          <Select options={sortOptions} value={sort} onChange={(v) => setSort(v as ChatSort)} />
        </div>
      </div>

      {info && (
        <div className="chats-info">
          <Icon name="IconCheckCircle" size={18} color="var(--status-success-solid)" />
          <span>{info}</span>
          <button className="hd-icon-btn" aria-label="Скрыть уведомление" onClick={() => setInfo(null)}>
            <Icon name="IconX" size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="chats-info chats-info--error">
          <Icon name="IconWarning" size={18} color="var(--status-error-solid)" />
          <span>{error}</span>
          <button className="hd-icon-btn" aria-label="Скрыть ошибку" onClick={() => setError(null)}>
            <Icon name="IconX" size={16} />
          </button>
        </div>
      )}

      <div className="chats-layout">
        <aside className="hd-card chats-list">
          <div className="chats-list__head">
            <h3 className="hd-h3">Дома и чаты</h3>
            <Badge color="brand" size="sm">{filteredThreads.length}</Badge>
          </div>
          {loading && <div className="empty-hint">Загрузка сообщений…</div>}
          {!loading && filteredThreads.length === 0 && <div className="empty-hint">Пока нет MAX-диалогов</div>}
          {filteredThreads.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            return (
              <button
                key={thread.id}
                className={`chats-list__item${thread.id === selected?.id ? ' chats-list__item--active' : ''}`}
                onClick={() => setSelectedChatId(thread.id)}
              >
                <div className="chats-list__top">
                  <span className="chats-list__building">{thread.buildingName}</span>
                  <span className="chats-list__time">{shortTime.format(new Date(thread.lastAt))}</span>
                </div>
                <div className="chats-list__meta">
                  <span>{thread.chatLabel}</span>
                  {thread.unread > 0 && (
                    <Badge color="warning" size="sm">{thread.unread}</Badge>
                  )}
                </div>
                <div className="chats-list__preview">{last?.text ?? 'Нет сообщений'}</div>
              </button>
            );
          })}
        </aside>

        <section className="hd-card chats-thread">
          {selected ? (
            <>
              <div className="chats-thread__head">
                <div>
                  <h3 className="hd-h3">{selected.buildingName}</h3>
                  <div className="chats-thread__sub">
                    {selected.chatLabel} · {selected.messages.length} сообщений
                  </div>
                </div>
                <Badge color={selected.routable ? 'neutral' : 'warning'} size="sm">
                  {selected.routable ? 'Общий чат УК' : 'Чат не привязан к MAX'}
                </Badge>
              </div>

              <div className="chats-thread__messages">
                {selected.messages.length === 0 && <div className="empty-hint">Сообщений в этом чате нет</div>}
                {selected.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chats-message${message.incoming ? '' : ' chats-message--outgoing'}`}
                  >
                    <Avatar name={message.author} size="xs" />
                    <div className="chats-message__bubble">
                      <div className="chats-message__meta">
                        <span className="chats-message__author">{message.author}</span>
                        <span>{dateTime.format(new Date(message.createdAt))}</span>
                      </div>
                      <div
                        className={`chats-message__text${
                          expandedMessages.has(message.id) ? ' chats-message__text--expanded' : ''
                        }`}
                      >
                        {message.text}
                      </div>
                      <div className="chats-message__actions">
                        <button
                          className="chats-message__action"
                          onClick={() => selectMessageForReply(message)}
                        >
                          Ответить
                        </button>
                        <button
                          className="chats-message__action"
                          onClick={() => toggleMessageExpanded(message.id)}
                        >
                          {expandedMessages.has(message.id) ? 'Свернуть' : 'Показать полностью'}
                        </button>
                        <button
                          className="chats-message__action"
                          onClick={() => void deleteMessage(message)}
                          disabled={deletingMessageId === message.id || !message.messageId}
                          title={message.messageId ? 'Удалить сообщение из MAX' : 'Для этого сообщения нет messageId'}
                        >
                          {deletingMessageId === message.id ? 'Удаление…' : 'Удалить'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-hint">Выберите дом слева, чтобы открыть диалог</div>
          )}
        </section>

        <aside className="hd-card chats-actions">
          <div className="chats-actions__block">
            <h3 className="hd-h3">Ответ в чат</h3>
            <p className="chats-actions__sub">Сначала выберите дом, затем отправьте сообщение</p>
            {replyToMessage && (
              <div className="chats-reply-context">
                <div className="chats-reply-context__title">
                  Ответ на сообщение {replyToMessage.author}
                </div>
                <div className="chats-reply-context__text">{replyToMessage.text}</div>
                <button
                  className="chats-message__action"
                  onClick={() => setReplyToMessage(null)}
                >
                  Сбросить
                </button>
              </div>
            )}
            <Select
              options={replyTargetOptions}
              value={replyTargetKey}
              onChange={setReplyTargetKey}
            />
            <InputTextarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoResize
              rows={4}
              placeholder={
                selectedReplyTarget
                  ? `Сообщение для ${selectedReplyTarget.buildingName}`
                  : 'Нет доступных домов для ответа'
              }
              disabled={!selectedReplyTarget || sendingReply}
            />
            <Button
              variant="primary"
              onClick={() => void sendReply()}
              disabled={!selectedReplyTarget || replyText.trim().length < 2 || sendingReply}
            >
              {sendingReply ? 'Отправка…' : 'Ответить'}
            </Button>
          </div>

          <div className="chats-actions__block">
            <h3 className="hd-h3">Массовая рассылка</h3>
            <p className="chats-actions__sub">По текущему фильтру домов</p>
            <InputTextarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              autoResize
              rows={4}
              placeholder="Текст для всех выбранных чатов"
            />
            <Button
              variant="secondary"
              onClick={() => void sendBroadcast()}
              disabled={broadcastText.trim().length < 2 || !filteredThreads.some((thread) => thread.routable) || sendingBroadcast}
            >
              {sendingBroadcast ? 'Отправка…' : 'Отправить всем'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
