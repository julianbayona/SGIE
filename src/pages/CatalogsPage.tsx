import React, { useMemo, useState } from 'react';

type CatalogKey =
  | 'tipo_mesa'
  | 'tipo_silla'
  | 'mantel'
  | 'sobremantel'
  | 'color'
  | 'tipo_adicional'
  | 'salon';

type FieldType = 'text' | 'number' | 'select' | 'color';
type CatalogRecord = Record<string, string | number | boolean>;

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

interface CatalogConfig {
  label: string;
  dbTable: string;
  idKey: string;
  description: string;
  fields: FieldConfig[];
}

const catalogConfigs: Record<CatalogKey, CatalogConfig> = {
  tipo_mesa: {
    label: 'Tipos de mesa',
    dbTable: 'tipo_mesa',
    idKey: 'id_tipo_mesa',
    description: 'Catálogo usado en el montaje de mesas por reserva.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'activo', label: 'Activo', type: 'select', options: ['Sí', 'No'] },
    ],
  },
  tipo_silla: {
    label: 'Tipos de silla',
    dbTable: 'tipo_silla',
    idKey: 'id_tipo_silla',
    description: 'Catálogo de sillas disponibles para montaje.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'activo', label: 'Activo', type: 'select', options: ['Sí', 'No'] },
    ],
  },
  mantel: {
    label: 'Manteles',
    dbTable: 'mantel',
    idKey: 'id_mantel',
    description: 'Manteles asociados a un color del catálogo.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'color', label: 'Color', type: 'select', required: true },
      { key: 'activo', label: 'Activo', type: 'select', options: ['Sí', 'No'] },
    ],
  },
  sobremantel: {
    label: 'Sobremanteles',
    dbTable: 'sobremantel',
    idKey: 'id_sobremantel',
    description: 'Sobremanteles asociados a un color del catálogo.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'color', label: 'Color', type: 'select', required: true },
      { key: 'activo', label: 'Activo', type: 'select', options: ['Sí', 'No'] },
    ],
  },
  color: {
    label: 'Colores',
    dbTable: 'color',
    idKey: 'id_color',
    description: 'Colores reutilizados por manteles y sobremanteles.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'codigo_hex', label: 'Código HEX', type: 'color', required: true },
      { key: 'activo', label: 'Activo', type: 'select', options: ['Sí', 'No'] },
    ],
  },
  tipo_adicional: {
    label: 'Tipos de adicional',
    dbTable: 'tipo_adicional',
    idKey: 'id_tipo_adicional',
    description: 'Adicionales del montaje con modo de cobro y precio base.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'modo_cobro', label: 'Modo de cobro', type: 'select', required: true, options: ['servicio', 'unidad'] },
      { key: 'precio_base', label: 'Precio base', type: 'number', required: true },
    ],
  },
  salon: {
    label: 'Salones',
    dbTable: 'salon',
    idKey: 'id_salon',
    description: 'Espacios físicos reservables para eventos.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'capacidad_max', label: 'Capacidad máxima', type: 'number', required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'select', options: ['Sí', 'No'] },
    ],
  },
};

const initialData: Record<CatalogKey, CatalogRecord[]> = {
  tipo_mesa: [
    { id_tipo_mesa: 1, nombre: 'Redonda', activo: true },
    { id_tipo_mesa: 2, nombre: 'Rectangular', activo: true },
    { id_tipo_mesa: 3, nombre: 'Imperial', activo: true },
  ],
  tipo_silla: [
    { id_tipo_silla: 1, nombre: 'Tiffany', activo: true },
    { id_tipo_silla: 2, nombre: 'Crossback', activo: true },
    { id_tipo_silla: 3, nombre: 'Napoleón', activo: true },
  ],
  mantel: [
    { id_mantel: 1, nombre: 'Lino premium', color: 'Marfil real', activo: true },
    { id_mantel: 2, nombre: 'Algodón clásico', color: 'Blanco perla', activo: true },
  ],
  sobremantel: [
    { id_sobremantel: 1, nombre: 'Organza', color: 'Dorado viejo', activo: true },
    { id_sobremantel: 2, nombre: 'Encaje', color: 'Marfil suave', activo: true },
  ],
  color: [
    { id_color: 1, nombre: 'Marfil real', codigo_hex: '#EFE4CE', activo: true },
    { id_color: 2, nombre: 'Blanco perla', codigo_hex: '#F4F4EF', activo: true },
    { id_color: 3, nombre: 'Dorado viejo', codigo_hex: '#B08A3F', activo: true },
  ],
  tipo_adicional: [
    { id_tipo_adicional: 1, nombre: 'Tarimas', modo_cobro: 'unidad', precio_base: 180000 },
    { id_tipo_adicional: 2, nombre: 'Audiovisuales', modo_cobro: 'servicio', precio_base: 450000 },
    { id_tipo_adicional: 3, nombre: 'Luces árbol', modo_cobro: 'servicio', precio_base: 260000 },
  ],
  salon: [
    { id_salon: 1, nombre: 'Salón Jade', capacidad_max: 120, descripcion: 'Ambiente señorial para eventos sociales.', activo: true },
    { id_salon: 2, nombre: 'Versalles Principal', capacidad_max: 220, descripcion: 'Salón principal para eventos amplios.', activo: true },
    { id_salon: 3, nombre: 'Biblioteca', capacidad_max: 35, descripcion: 'Espacio reservado para reuniones pequeñas.', activo: true },
  ],
};

const catalogTabs: CatalogKey[] = ['tipo_mesa', 'tipo_silla', 'mantel', 'sobremantel', 'color', 'tipo_adicional', 'salon'];

const createEmptyForm = (config: CatalogConfig, colorOptions: string[]): CatalogRecord => {
  return config.fields.reduce<CatalogRecord>((acc, field) => {
    if (field.key === 'activo') {
      acc[field.key] = 'Sí';
      return acc;
    }

    if (field.key === 'color') {
      acc[field.key] = colorOptions[0] ?? '';
      return acc;
    }

    if (field.type === 'select') {
      acc[field.key] = field.options?.[0] ?? '';
      return acc;
    }

    acc[field.key] = field.type === 'number' ? 0 : '';
    return acc;
  }, {});
};

const formatValue = (value: string | number | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat('es-CO').format(value);
  }

  return value;
};

const CatalogsPage: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogKey>('tipo_mesa');
  const [catalogData, setCatalogData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const colorOptions = useMemo(
    () => catalogData.color.map((color) => String(color.nombre)).filter(Boolean),
    [catalogData.color]
  );

  const activeConfig = catalogConfigs[activeCatalog];
  const activeRows = catalogData[activeCatalog];
  const [form, setForm] = useState<CatalogRecord>(() => createEmptyForm(activeConfig, colorOptions));

  const resetForm = (catalog: CatalogKey = activeCatalog) => {
    const nextConfig = catalogConfigs[catalog];
    setEditingId(null);
    setForm(createEmptyForm(nextConfig, colorOptions));
  };

  const changeCatalog = (catalog: CatalogKey) => {
    setActiveCatalog(catalog);
    resetForm(catalog);
  };

  const updateFormValue = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveRecord = () => {
    const idKey = activeConfig.idKey;
    const normalizedForm = {
      ...form,
      activo: form.activo === 'Sí' || form.activo === true,
    };

    setCatalogData((prev) => {
      const rows = prev[activeCatalog];

      if (editingId !== null) {
        return {
          ...prev,
          [activeCatalog]: rows.map((row) =>
            row[idKey] === editingId ? { ...row, ...normalizedForm, [idKey]: editingId } : row
          ),
        };
      }

      const nextId = rows.reduce((max, row) => Math.max(max, Number(row[idKey]) || 0), 0) + 1;
      return {
        ...prev,
        [activeCatalog]: [{ [idKey]: nextId, ...normalizedForm }, ...rows],
      };
    });

    resetForm();
  };

  const editRecord = (record: CatalogRecord) => {
    const idValue = record[activeConfig.idKey];
    if (typeof idValue !== 'string' && typeof idValue !== 'number') {
      return;
    }

    setEditingId(idValue);
    setForm({
      ...record,
      activo: record.activo === true ? 'Sí' : 'No',
    });
  };

  const toggleActive = (record: CatalogRecord) => {
    const idKey = activeConfig.idKey;
    const idValue = record[idKey];

    setCatalogData((prev) => ({
      ...prev,
      [activeCatalog]: prev[activeCatalog].map((row) =>
        row[idKey] === idValue ? { ...row, activo: !(row.activo === true) } : row
      ),
    }));
  };

  const isSaveDisabled = activeConfig.fields.some((field) => {
    if (!field.required) {
      return false;
    }

    const value = form[field.key];
    return value === undefined || value === '';
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary-gold tracking-widest text-xs uppercase mb-2">Administración</p>
          <h1 className="text-2xl font-display font-bold text-on-surface">Catálogos</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestión operativa de catálogos base usados en salones, montaje y adicionales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_360px] gap-5">
        <aside className="bg-surface-container-lowest border border-border rounded-lg p-3 h-fit">
          <nav className="space-y-1">
            {catalogTabs.map((catalog) => {
              const config = catalogConfigs[catalog];
              const isActive = catalog === activeCatalog;

              return (
                <button
                  key={catalog}
                  type="button"
                  onClick={() => changeCatalog(catalog)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    isActive ? 'bg-gold-bg text-gold-d' : 'text-text2 hover:bg-hover'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="bg-surface-container-lowest border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-on-surface">{activeConfig.label}</h2>
              <p className="text-sm text-on-surface-variant mt-1">{activeConfig.description}</p>
            </div>
            <span className="text-xs font-bold text-text3 bg-surface-container-low px-2.5 py-1 rounded-full">
              {activeConfig.dbTable}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  {activeConfig.fields.map((field) => (
                    <th key={field.key} className="px-4 py-3">{field.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {activeRows.map((row) => (
                  <tr key={String(row[activeConfig.idKey])} className="hover:bg-stone-50/70">
                    <td className="px-4 py-3 text-xs font-bold text-primary-gold">#{row[activeConfig.idKey]}</td>
                    {activeConfig.fields.map((field) => {
                      const value = row[field.key];
                      const isColor = field.key === 'codigo_hex';

                      return (
                        <td key={field.key} className="px-4 py-3 text-sm text-on-surface">
                          {isColor && typeof value === 'string' ? (
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: value }}></span>
                              <span className="font-mono text-xs">{value}</span>
                            </div>
                          ) : (
                            <span>{formatValue(value ?? '')}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editRecord(row)}
                          className="px-3 py-1.5 rounded border border-border text-xs font-semibold text-text2 hover:bg-hover"
                        >
                          Editar
                        </button>
                        {'activo' in row ? (
                          <button
                            type="button"
                            onClick={() => toggleActive(row)}
                            className={`px-3 py-1.5 rounded border text-xs font-semibold ${
                              row.activo === true
                                ? 'border-red-border text-red-text hover:bg-red-bg'
                                : 'border-green-border text-green-text hover:bg-green-bg'
                            }`}
                          >
                            {row.activo === true ? 'Desactivar' : 'Activar'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <aside className="bg-surface-container-lowest border border-border rounded-lg p-5 h-fit shadow-sm">
          <h3 className="text-lg font-display font-bold text-on-surface">
            {editingId === null ? 'Nuevo registro' : 'Editar registro'}
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 mb-5">
            Los registros se desactivan para preservar trazabilidad; no se eliminan físicamente.
          </p>

          <div className="space-y-4">
            {activeConfig.fields.map((field) => {
              const value = form[field.key];
              const options = field.key === 'color' ? colorOptions : field.options;

              return (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                      value={String(value ?? '')}
                      onChange={(event) => updateFormValue(field.key, event.target.value)}
                    >
                      {(options ?? []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                      type={field.type === 'number' ? 'number' : field.type === 'color' ? 'color' : 'text'}
                      value={String(value ?? '')}
                      onChange={(event) => {
                        const nextValue = field.type === 'number' ? Number(event.target.value) : event.target.value;
                        updateFormValue(field.key, nextValue);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => resetForm()}
              className="px-4 py-2 rounded-md border border-border text-sm font-semibold text-text2 hover:bg-hover"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveRecord}
              disabled={isSaveDisabled}
              className="px-5 py-2 rounded-md bg-primary-gold text-white text-sm font-bold hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CatalogsPage;
