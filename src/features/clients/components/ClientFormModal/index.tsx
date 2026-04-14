import React, { useEffect, useMemo, useState } from 'react';
import type { Client, ClientCategory } from '@/features/clients/types';

export interface ClientFormValues {
  idNumber: string;
  fullName: string;
  category: ClientCategory;
  phone: string;
  email: string;
}

interface ClientFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialClient?: Client | null;
  idNumbersInUse: string[];
  onCancel: () => void;
  onSubmit: (values: ClientFormValues) => void;
}

const getEmptyForm = (): ClientFormValues => ({
  idNumber: '',
  fullName: '',
  category: 'Socio',
  phone: '',
  email: '',
});

const normalizeId = (value: string): string => value.replace(/[^\d]/g, '');

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  mode,
  initialClient,
  idNumbersInUse,
  onCancel,
  onSubmit,
}) => {
  const [form, setForm] = useState<ClientFormValues>(getEmptyForm);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'edit' && initialClient) {
      setForm({
        idNumber: normalizeId(initialClient.idNumber),
        fullName: initialClient.fullName,
        category: initialClient.category,
        phone: initialClient.phone,
        email: initialClient.email,
      });
      return;
    }

    setForm(getEmptyForm());
  }, [initialClient, isOpen, mode]);

  const normalizedId = useMemo(() => normalizeId(form.idNumber), [form.idNumber]);
  const isDuplicateId = useMemo(() => {
    if (!normalizedId) {
      return false;
    }

    return idNumbersInUse.includes(normalizedId);
  }, [idNumbersInUse, normalizedId]);

  const isSubmitDisabled =
    !normalizedId || !form.fullName.trim() || !form.phone.trim() || isDuplicateId;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-40 bg-black/28 backdrop-blur-[1.5px] h-full w-full flex items-center justify-center p-4 md:p-8 overflow-hidden"
      onClick={(eventTarget) => {
        if (eventTarget.target === eventTarget.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-4xl bg-[#f4f4f4] border border-stone-300 rounded-md shadow-[0_18px_42px_rgba(0,0,0,0.22)] p-5 md:p-6 space-y-5 mx-auto">
          <h3 className="text-xl font-bold text-[#1f1f1f]">Formulario Crear/Editar Cliente</h3>

          <div className="bg-blue-100/70 border border-blue-300 text-blue-700 text-sm rounded-md px-4 py-3">
            Si la cédula se valida en tiempo real. Si ya existe en el sistema, muestra alerta de duplicidad.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Cédula *</label>
              <input
                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2.5 text-sm"
                type="text"
                inputMode="numeric"
                placeholder="Sin puntos ni comas"
                value={form.idNumber}
                onChange={(eventTarget) => {
                  setForm((prev) => ({
                    ...prev,
                    idNumber: normalizeId(eventTarget.target.value),
                  }));
                }}
              />
              <p className="text-xs mt-2 text-stone-500">Clave primaria, no editable despues</p>
              {isDuplicateId ? (
                <p className="text-xs mt-1 text-red-600 font-semibold">Esta cédula ya existe en el sistema.</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Nombre completo *</label>
              <input
                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2.5 text-sm"
                type="text"
                placeholder="Nombres y apellidos"
                value={form.fullName}
                onChange={(eventTarget) => {
                  setForm((prev) => ({
                    ...prev,
                    fullName: eventTarget.target.value,
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Tipo *</label>
              <select
                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2.5 text-sm"
                value={form.category}
                onChange={(eventTarget) => {
                  setForm((prev) => ({
                    ...prev,
                    category: eventTarget.target.value as ClientCategory,
                  }));
                }}
              >
                <option value="Socio">Socio</option>
                <option value="No Socio">No Socio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Teléfono *</label>
              <input
                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2.5 text-sm"
                type="text"
                placeholder="Número WhatsApp"
                value={form.phone}
                onChange={(eventTarget) => {
                  setForm((prev) => ({
                    ...prev,
                    phone: eventTarget.target.value,
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Correo electrónico</label>
              <input
                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2.5 text-sm"
                type="email"
                placeholder="Para notificaciones"
                value={form.email}
                onChange={(eventTarget) => {
                  setForm((prev) => ({
                    ...prev,
                    email: eventTarget.target.value,
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              className="bg-[#1d1d1d] text-white px-5 py-2.5 rounded-md text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled}
              onClick={() => {
                onSubmit({
                  ...form,
                  idNumber: normalizedId,
                  fullName: form.fullName.trim(),
                  phone: form.phone.trim(),
                  email: form.email.trim(),
                });
              }}
            >
              Guardar
            </button>
            <button
              type="button"
              className="text-sm font-medium text-stone-700 hover:text-stone-900"
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
      </div>
    </div>
  );
};

export default ClientFormModal;
