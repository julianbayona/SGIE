import React, { useEffect, useState } from 'react';
import catalogosApi from '@/api/catalogos';
import salonesApi from '@/api/salones';
import type {
  CatalogoBasicoResponse,
  TipoAdicionalResponse,
  SalonResponse,
  PlatoResponse,
  TipoMomentoMenuResponse,
} from '@/api/types';

type CatalogKey =
  | 'tipo_evento'
  | 'tipo_comida'
  | 'tipo_mesa'
  | 'tipo_silla'
  | 'mantel'
  | 'sobremantel'
  | 'color'
  | 'tipo_adicional'
  | 'salon'
  | 'plato'
  | 'tipo_momento_menu';

interface CatalogTab {
  key: CatalogKey;
  label: string;
  description: string;
}

const catalogTabs: CatalogTab[] = [
  { key: 'tipo_evento', label: 'Tipos de evento', description: 'Categorias de eventos disponibles.' },
  { key: 'tipo_comida', label: 'Tipos de comida', description: 'Servicios de alimentacion disponibles.' },
  { key: 'tipo_mesa', label: 'Tipos de mesa', description: 'Catalogo usado en el montaje de mesas.' },
  { key: 'tipo_silla', label: 'Tipos de silla', description: 'Sillas disponibles para montaje.' },
  { key: 'mantel', label: 'Manteles', description: 'Manteles asociados a colores del catalogo.' },
  { key: 'sobremantel', label: 'Sobremanteles', description: 'Sobremanteles asociados a colores.' },
  { key: 'color', label: 'Colores', description: 'Colores reutilizados por manteles y sobremanteles.' },
  { key: 'tipo_adicional', label: 'Tipos de adicional', description: 'Adicionales del montaje con modo de cobro y precio base.' },
  { key: 'plato', label: 'Platos', description: 'Catalogo base de platos disponibles para menu.' },
  { key: 'tipo_momento_menu', label: 'Momentos de menu', description: 'Momentos configurables del flujo gastronomico.' },
  { key: 'salon', label: 'Salones', description: 'Espacios fisicos reservables para eventos.' },
];

type GenericRow =
  | CatalogoBasicoResponse
  | TipoAdicionalResponse
  | SalonResponse
  | PlatoResponse
  | TipoMomentoMenuResponse;

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

const CatalogsPage: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogKey>('tipo_evento');
  const [rows, setRows] = useState<GenericRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formCapacidad, setFormCapacidad] = useState(0);
  const [formModoCobro, setFormModoCobro] = useState<'UNIDAD' | 'SERVICIO'>('SERVICIO');
  const [formPrecioBase, setFormPrecioBase] = useState(0);
  const [saving, setSaving] = useState(false);

  const isSalon = activeCatalog === 'salon';
  const isTipoAdicional = activeCatalog === 'tipo_adicional';
  const isPlato = activeCatalog === 'plato';
  const isTipoMomentoMenu = activeCatalog === 'tipo_momento_menu';
  const activeTab = catalogTabs.find((tab) => tab.key === activeCatalog)!;

  const resetForm = () => {
    setEditingId(null);
    setFormNombre('');
    setFormDescripcion('');
    setFormCapacidad(0);
    setFormModoCobro('SERVICIO');
    setFormPrecioBase(0);
  };

  const loadCatalog = async (key: CatalogKey) => {
    setLoading(true);
    setError(null);

    try {
      let data: GenericRow[] = [];

      switch (key) {
        case 'tipo_evento': data = await catalogosApi.tiposEvento.listar(); break;
        case 'tipo_comida': data = await catalogosApi.tiposComida.listar(); break;
        case 'tipo_mesa': data = await catalogosApi.tiposMesa.listar(); break;
        case 'tipo_silla': data = await catalogosApi.tiposSilla.listar(); break;
        case 'mantel': data = await catalogosApi.manteles.listar(); break;
        case 'sobremantel': data = await catalogosApi.sobremanteles.listar(); break;
        case 'color': data = await catalogosApi.colores.listar(); break;
        case 'tipo_adicional': data = await catalogosApi.tiposAdicional.listar(); break;
        case 'plato': data = await catalogosApi.platos.listar(); break;
        case 'tipo_momento_menu': data = await catalogosApi.tiposMomentoMenu.listar(); break;
        case 'salon': data = await salonesApi.listar(); break;
      }

      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el catalogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog(activeCatalog);
    resetForm();
  }, [activeCatalog]);

  const startEdit = (row: GenericRow) => {
    setEditingId(row.id);
    setFormNombre('nombre' in row ? row.nombre : '');
    setFormDescripcion('descripcion' in row ? row.descripcion ?? '' : '');
    setFormCapacidad('capacidad' in row ? (row as SalonResponse).capacidad : 0);
    setFormModoCobro('modoCobro' in row ? (row as TipoAdicionalResponse).modoCobro : 'SERVICIO');
    setFormPrecioBase('precioBase' in row ? Number((row as TipoAdicionalResponse).precioBase) : 0);
  };

  const handleSave = async () => {
    if (!formNombre.trim()) {
      return;
    }

    setSaving(true);

    try {
      const basicData = { nombre: formNombre.trim(), descripcion: formDescripcion.trim() || undefined };
      const salonData = {
        nombre: formNombre.trim(),
        capacidad: formCapacidad,
        descripcion: formDescripcion.trim() || undefined,
      };
      const tipoAdicionalData = {
        nombre: formNombre.trim(),
        modoCobro: formModoCobro,
        precioBase: formPrecioBase,
      };
      const platoData = {
        nombre: formNombre.trim(),
        descripcion: formDescripcion.trim() || undefined,
        precioBase: formPrecioBase,
      };
      const tipoMomentoMenuData = {
        nombre: formNombre.trim(),
      };

      if (editingId) {
        switch (activeCatalog) {
          case 'tipo_evento': await catalogosApi.tiposEvento.actualizar(editingId, basicData); break;
          case 'tipo_comida': await catalogosApi.tiposComida.actualizar(editingId, basicData); break;
          case 'tipo_mesa': await catalogosApi.tiposMesa.actualizar(editingId, basicData); break;
          case 'tipo_silla': await catalogosApi.tiposSilla.actualizar(editingId, basicData); break;
          case 'mantel': await catalogosApi.manteles.actualizar(editingId, basicData); break;
          case 'sobremantel': await catalogosApi.sobremanteles.actualizar(editingId, basicData); break;
          case 'color': await catalogosApi.colores.actualizar(editingId, basicData); break;
          case 'tipo_adicional': await catalogosApi.tiposAdicional.actualizar(editingId, tipoAdicionalData); break;
          case 'plato': await catalogosApi.platos.actualizar(editingId, platoData); break;
          case 'tipo_momento_menu': await catalogosApi.tiposMomentoMenu.actualizar(editingId, tipoMomentoMenuData); break;
          default: break;
        }
      } else {
        switch (activeCatalog) {
          case 'tipo_evento': await catalogosApi.tiposEvento.crear(basicData); break;
          case 'tipo_comida': await catalogosApi.tiposComida.crear(basicData); break;
          case 'tipo_mesa': await catalogosApi.tiposMesa.crear(basicData); break;
          case 'tipo_silla': await catalogosApi.tiposSilla.crear(basicData); break;
          case 'mantel': await catalogosApi.manteles.crear(basicData); break;
          case 'sobremantel': await catalogosApi.sobremanteles.crear(basicData); break;
          case 'color': await catalogosApi.colores.crear(basicData); break;
          case 'tipo_adicional': await catalogosApi.tiposAdicional.crear(tipoAdicionalData); break;
          case 'plato': await catalogosApi.platos.crear(platoData); break;
          case 'tipo_momento_menu': await catalogosApi.tiposMomentoMenu.crear(tipoMomentoMenuData); break;
          case 'salon': await salonesApi.registrar(salonData); break;
        }
      }

      await loadCatalog(activeCatalog);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      switch (activeCatalog) {
        case 'tipo_evento': await catalogosApi.tiposEvento.desactivar(id); break;
        case 'tipo_comida': await catalogosApi.tiposComida.desactivar(id); break;
        case 'tipo_mesa': await catalogosApi.tiposMesa.desactivar(id); break;
        case 'tipo_silla': await catalogosApi.tiposSilla.desactivar(id); break;
        case 'mantel': await catalogosApi.manteles.desactivar(id); break;
        case 'sobremantel': await catalogosApi.sobremanteles.desactivar(id); break;
        case 'color': await catalogosApi.colores.desactivar(id); break;
        case 'tipo_adicional': await catalogosApi.tiposAdicional.desactivar(id); break;
        case 'plato': await catalogosApi.platos.desactivar(id); break;
        case 'tipo_momento_menu': await catalogosApi.tiposMomentoMenu.desactivar(id); break;
        default: return;
      }

      await loadCatalog(activeCatalog);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al desactivar.');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-primary-gold tracking-widest text-xs uppercase mb-2">Administracion</p>
        <h1 className="text-2xl font-display font-bold text-on-surface">Catalogos</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Gestion operativa de catalogos base usados en salones, montaje y adicionales.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_340px] gap-5">
        <aside className="bg-surface-container-lowest border border-border rounded-lg p-3 h-fit">
          <nav className="space-y-1">
            {catalogTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCatalog(tab.key)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  tab.key === activeCatalog ? 'bg-gold-bg text-gold-d' : 'text-text2 hover:bg-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="bg-surface-container-lowest border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-xl font-display font-bold text-on-surface">{activeTab.label}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{activeTab.description}</p>
          </div>

          {error ? (
            <div className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-16 text-on-surface-variant text-sm">
              Cargando...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    {isSalon ? <th className="px-4 py-3">Capacidad</th> : null}
                    {isTipoAdicional ? <th className="px-4 py-3">Modo cobro</th> : null}
                    {isTipoAdicional ? <th className="px-4 py-3">Precio base</th> : null}
                    {isPlato ? <th className="px-4 py-3">Precio base</th> : null}
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {rows.map((row) => {
                    const isActive = 'activo' in row ? row.activo : true;

                    return (
                      <tr key={row.id} className="hover:bg-stone-50/70">
                        <td className="px-4 py-3 text-sm font-semibold text-on-surface">
                          {'nombre' in row ? row.nombre : ''}
                          {'descripcion' in row && row.descripcion ? (
                            <p className="text-xs text-on-surface-variant font-normal mt-0.5">{row.descripcion}</p>
                          ) : null}
                        </td>
                        {isSalon ? (
                          <td className="px-4 py-3 text-sm text-on-surface-variant">
                            {(row as SalonResponse).capacidad} pax
                          </td>
                        ) : null}
                        {isTipoAdicional ? (
                          <>
                            <td className="px-4 py-3 text-sm text-on-surface-variant">
                              {(row as TipoAdicionalResponse).modoCobro === 'UNIDAD' ? 'Por unidad' : 'Por servicio'}
                            </td>
                            <td className="px-4 py-3 text-sm text-on-surface-variant">
                              {formatCOP(Number((row as TipoAdicionalResponse).precioBase))}
                            </td>
                          </>
                        ) : null}
                        {isPlato ? (
                          <td className="px-4 py-3 text-sm text-on-surface-variant">
                            {formatCOP(Number((row as PlatoResponse).precioBase))}
                          </td>
                        ) : null}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                            isActive ? 'bg-green-bg text-green-text' : 'bg-surface-container-low text-on-surface-variant'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green' : 'bg-stone-400'}`}></span>
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              className="px-3 py-1.5 rounded border border-border text-xs font-semibold text-text2 hover:bg-hover"
                            >
                              Editar
                            </button>
                            {!isSalon ? (
                              <button
                                type="button"
                                onClick={() => handleDesactivar(row.id)}
                                className={`px-3 py-1.5 rounded border text-xs font-semibold ${
                                  isActive
                                    ? 'border-red-border text-red-text hover:bg-red-bg'
                                    : 'border-green-border text-green-text hover:bg-green-bg'
                                }`}
                              >
                                {isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-on-surface-variant">
                        No hay registros en este catalogo.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <aside className="bg-surface-container-lowest border border-border rounded-lg p-5 h-fit shadow-sm">
          <h3 className="text-lg font-display font-bold text-on-surface">
            {editingId ? 'Editar registro' : 'Nuevo registro'}
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 mb-5">
            Los registros se desactivan para preservar trazabilidad.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Nombre *</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                type="text"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Nombre del registro"
              />
            </div>

            {!isSalon && !isTipoAdicional && !isTipoMomentoMenu ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Descripcion</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                  type="text"
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            ) : null}

            {isSalon ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Capacidad maxima *</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    type="number"
                    min={1}
                    value={formCapacidad}
                    onChange={(e) => setFormCapacidad(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Descripcion</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    type="text"
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </>
            ) : null}

            {isTipoAdicional ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Modo de cobro *</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    value={formModoCobro}
                    onChange={(e) => setFormModoCobro(e.target.value as 'UNIDAD' | 'SERVICIO')}
                  >
                    <option value="SERVICIO">Por servicio</option>
                    <option value="UNIDAD">Por unidad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Precio base *</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    type="number"
                    min={0}
                    value={formPrecioBase}
                    onChange={(e) => setFormPrecioBase(Number(e.target.value) || 0)}
                  />
                </div>
              </>
            ) : null}

            {isPlato ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Precio base *</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                  type="number"
                  min={0}
                  value={formPrecioBase}
                  onChange={(e) => setFormPrecioBase(Number(e.target.value) || 0)}
                />
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-md border border-border text-sm font-semibold text-text2 hover:bg-hover"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                !formNombre.trim() ||
                saving ||
                (isSalon && formCapacidad < 1) ||
                ((isTipoAdicional || isPlato) && formPrecioBase < 0)
              }
              className="px-5 py-2 rounded-md bg-primary-gold text-white text-sm font-bold hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CatalogsPage;
