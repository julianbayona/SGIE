import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import { getEventSummaryById } from '@/features/events/data/eventSummary';

type AgendaCategory = 'degustacion' | 'anticipo';
type AgendaStatus = 'programado' | 'enviado' | 'completado' | 'cancelado';
type ReminderChannel = 'interno' | 'whatsapp' | 'email' | 'llamada';

interface AgendaEntry {
  id: string;
  category: AgendaCategory;
  milestone: string;
  scheduledAt: string;
  channel: ReminderChannel;
  notes: string;
  status: AgendaStatus;
}

const categoryLabel: Record<AgendaCategory, string> = {
  degustacion: 'Prueba de plato',
  anticipo: 'Recordatorio anticipo',
};

const statusLabel: Record<AgendaStatus, string> = {
  programado: 'Programado',
  enviado: 'Enviado',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const channelLabel: Record<ReminderChannel, string> = {
  interno: 'Interno',
  whatsapp: 'WhatsApp',
  email: 'Email',
  llamada: 'Llamada',
};

const statusPillClass: Record<AgendaStatus, string> = {
  programado: 'bg-blue-50 text-blue-700',
  enviado: 'bg-amber-50 text-amber-700',
  completado: 'bg-green-50 text-green-700',
  cancelado: 'bg-stone-200 text-stone-600',
};

const formatDateTime = (value: string): string => {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha invalida';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const sortByScheduledAt = (entries: AgendaEntry[]): AgendaEntry[] => {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.scheduledAt).getTime();
    const timeB = new Date(b.scheduledAt).getTime();

    return timeA - timeB;
  });
};

const EventAgendaPage: React.FC = () => {
  const { eventId } = useParams();
  const event = useMemo(() => getEventSummaryById(eventId), [eventId]);

  const [entries, setEntries] = useState<AgendaEntry[]>([
    {
      id: 'ag-001',
      category: 'degustacion',
      milestone: 'Prueba de plato #1',
      scheduledAt: '2025-06-10T16:00',
      channel: 'whatsapp',
      notes: 'Confirmar asistencia de novios y planner.',
      status: 'programado',
    },
    {
      id: 'ag-002',
      category: 'degustacion',
      milestone: 'Prueba de plato #2',
      scheduledAt: '2025-06-17T16:00',
      channel: 'interno',
      notes: 'Validar cambios de proteina y postre.',
      status: 'programado',
    },
    {
      id: 'ag-003',
      category: 'anticipo',
      milestone: 'Anticipo 50% - recordatorio #1',
      scheduledAt: '2025-06-12T09:00',
      channel: 'email',
      notes: 'Enviar factura adjunta.',
      status: 'enviado',
    },
    {
      id: 'ag-004',
      category: 'anticipo',
      milestone: 'Anticipo 50% - recordatorio #2',
      scheduledAt: '2025-06-18T10:30',
      channel: 'whatsapp',
      notes: 'Recordar fecha limite de pago.',
      status: 'programado',
    },
  ]);

  const [newCategory, setNewCategory] = useState<AgendaCategory>('degustacion');
  const [newMilestone, setNewMilestone] = useState('Prueba de plato #1');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newChannel, setNewChannel] = useState<ReminderChannel>('whatsapp');
  const [newNotes, setNewNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todos' | AgendaCategory>('todos');

  const totalTastings = useMemo(
    () => entries.filter((entry) => entry.category === 'degustacion').length,
    [entries]
  );
  const totalAdvanceReminders = useMemo(
    () => entries.filter((entry) => entry.category === 'anticipo').length,
    [entries]
  );
  const totalPending = useMemo(
    () => entries.filter((entry) => entry.status === 'programado' || entry.status === 'enviado').length,
    [entries]
  );

  const visibleEntries = useMemo(() => {
    const baseEntries =
      filterCategory === 'todos'
        ? entries
        : entries.filter((entry) => entry.category === filterCategory);

    return sortByScheduledAt(baseEntries);
  }, [entries, filterCategory]);

  const resetMilestoneByCategory = (category: AgendaCategory) => {
    if (category === 'degustacion') {
      setNewMilestone('Prueba de plato #1');
      return;
    }

    setNewMilestone('Anticipo 50% - recordatorio #1');
  };

  const createEntry = () => {
    if (!newMilestone.trim() || !newScheduledAt) {
      return;
    }

    setEntries((prev) => [
      ...prev,
      {
        id: `ag-${Date.now()}`,
        category: newCategory,
        milestone: newMilestone.trim(),
        scheduledAt: newScheduledAt,
        channel: newChannel,
        notes: newNotes.trim(),
        status: 'programado',
      },
    ]);

    setNewScheduledAt('');
    setNewNotes('');
  };

  const updateStatus = (id: string, status: AgendaStatus) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        return {
          ...entry,
          status,
        };
      })
    );
  };

  return (
    <section className="space-y-8 pb-24">
      <EventDetailHeaderTabs event={event} activeTab="agenda" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Pruebas de plato</p>
          <p className="text-3xl font-display font-bold text-on-surface mt-1">{totalTastings}</p>
        </div>
        <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Recordatorios de anticipo</p>
          <p className="text-3xl font-display font-bold text-on-surface mt-1">{totalAdvanceReminders}</p>
        </div>
        <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Pendientes por ejecutar</p>
          <p className="text-3xl font-display font-bold text-primary-gold mt-1">{totalPending}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <section className="bg-surface-container-lowest border border-border rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h4 className="text-2xl font-display font-bold text-on-surface">Agenda de recordatorios</h4>
              <p className="text-sm text-on-surface-variant mt-1">
                Crea multiples agendamientos para degustacion y multiples recordatorios para cada anticipo.
              </p>
            </div>
            <select
              className="bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2 text-sm"
              value={filterCategory}
              onChange={(eventTarget) => setFilterCategory(eventTarget.target.value as 'todos' | AgendaCategory)}
            >
              <option value="todos">Todos</option>
              <option value="degustacion">Pruebas de plato</option>
              <option value="anticipo">Recordatorios de anticipo</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2.5">Fecha</th>
                  <th className="px-3 py-2.5">Tipo</th>
                  <th className="px-3 py-2.5">Hito</th>
                  <th className="px-3 py-2.5">Canal</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest text-sm">
                {visibleEntries.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-on-surface-variant italic" colSpan={6}>
                      No hay recordatorios para el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  visibleEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-3 py-2.5 text-on-surface-variant whitespace-nowrap">{formatDateTime(entry.scheduledAt)}</td>
                      <td className="px-3 py-2.5 text-on-surface whitespace-nowrap">{categoryLabel[entry.category]}</td>
                      <td className="px-3 py-2.5 font-medium text-on-surface">{entry.milestone}</td>
                      <td className="px-3 py-2.5 text-on-surface-variant whitespace-nowrap">{channelLabel[entry.channel]}</td>
                      <td className="px-3 py-2.5">
                        <select
                          className={`text-xs font-bold rounded-full px-2.5 py-1 border-none ${statusPillClass[entry.status]}`}
                          value={entry.status}
                          onChange={(eventTarget) => updateStatus(entry.id, eventTarget.target.value as AgendaStatus)}
                        >
                          <option value="programado">{statusLabel.programado}</option>
                          <option value="enviado">{statusLabel.enviado}</option>
                          <option value="completado">{statusLabel.completado}</option>
                          <option value="cancelado">{statusLabel.cancelado}</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-on-surface-variant max-w-[300px]">{entry.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="bg-surface-container-lowest border border-border rounded-xl p-6 shadow-sm space-y-5">
          <h4 className="text-xl font-display font-bold text-on-surface">Nuevo agendamiento</h4>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Tipo</label>
            <select
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
              value={newCategory}
              onChange={(eventTarget) => {
                const nextCategory = eventTarget.target.value as AgendaCategory;
                setNewCategory(nextCategory);
                resetMilestoneByCategory(nextCategory);
              }}
            >
              <option value="degustacion">Prueba de plato</option>
              <option value="anticipo">Recordatorio de anticipo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Hito</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
              type="text"
              value={newMilestone}
              onChange={(eventTarget) => setNewMilestone(eventTarget.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Fecha y hora</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
              type="datetime-local"
              value={newScheduledAt}
              onChange={(eventTarget) => setNewScheduledAt(eventTarget.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Canal</label>
            <select
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
              value={newChannel}
              onChange={(eventTarget) => setNewChannel(eventTarget.target.value as ReminderChannel)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="llamada">Llamada</option>
              <option value="interno">Interno</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Notas</label>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm min-h-[86px]"
              value={newNotes}
              placeholder="Detalle opcional para el equipo..."
              onChange={(eventTarget) => setNewNotes(eventTarget.target.value)}
            ></textarea>
          </div>

          <button
            type="button"
            className="w-full bg-[#191C1D] text-white px-6 py-3 rounded-md text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!newMilestone.trim() || !newScheduledAt}
            onClick={createEntry}
          >
            Agendar recordatorio
          </button>
        </aside>
      </div>
    </section>
  );
};

export default EventAgendaPage;
