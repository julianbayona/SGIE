import apiClient from './client';
import type { 
  CatalogoBasicoResponse, 
  CatalogoBasicoRequest, 
  TipoAdicionalResponse,
  PlatoResponse,
  TipoMomentoMenuResponse
} from './types';

/** Fábrica genérica para catálogos con estructura básica (nombre + descripción). */
function makeCatalogoBasico(path: string) {
  return {
    listar(): Promise<CatalogoBasicoResponse[]> {
      return apiClient.get<CatalogoBasicoResponse[]>(path).then((r) => r.data);
    },
    obtenerPorId(id: string): Promise<CatalogoBasicoResponse> {
      return apiClient.get<CatalogoBasicoResponse>(`${path}/${id}`).then((r) => r.data);
    },
    crear(data: CatalogoBasicoRequest): Promise<CatalogoBasicoResponse> {
      return apiClient.post<CatalogoBasicoResponse>(path, data).then((r) => r.data);
    },
    actualizar(id: string, data: CatalogoBasicoRequest): Promise<CatalogoBasicoResponse> {
      return apiClient.put<CatalogoBasicoResponse>(`${path}/${id}`, data).then((r) => r.data);
    },
    desactivar(id: string): Promise<CatalogoBasicoResponse> {
      return apiClient.delete<CatalogoBasicoResponse>(`${path}/${id}`).then((r) => r.data);
    },
  };
}

const catalogosApi = {
  tiposEvento: makeCatalogoBasico('/catalogos/tipos-evento'),
  tiposComida: makeCatalogoBasico('/catalogos/tipos-comida'),
  tiposMesa: makeCatalogoBasico('/catalogos/tipos-mesa'),
  tiposSilla: makeCatalogoBasico('/catalogos/tipos-silla'),
  colores: makeCatalogoBasico('/catalogos/colores'),
  manteles: makeCatalogoBasico('/catalogos/manteles'),
  sobremanteles: makeCatalogoBasico('/catalogos/sobremanteles'),

  tiposAdicional: {
    listar(): Promise<TipoAdicionalResponse[]> {
      return apiClient
        .get<TipoAdicionalResponse[]>('/catalogos/tipos-adicional')
        .then((r) => r.data);
    },
    obtenerPorId(id: string): Promise<TipoAdicionalResponse> {
      return apiClient
        .get<TipoAdicionalResponse>(`/catalogos/tipos-adicional/${id}`)
        .then((r) => r.data);
    },
  },

  platos: {
    listar(): Promise<PlatoResponse[]> {
      return apiClient
        .get<PlatoResponse[]>('/catalogos/platos')
        .then((r) => r.data);
    },
    obtenerPorId(id: string): Promise<PlatoResponse> {
      return apiClient
        .get<PlatoResponse>(`/catalogos/platos/${id}`)
        .then((r) => r.data);
    },
  },

  tiposMomentoMenu: {
    listar(): Promise<TipoMomentoMenuResponse[]> {
      return apiClient
        .get<TipoMomentoMenuResponse[]>('/catalogos/tipos-momento-menu')
        .then((r) => r.data);
    },
    obtenerPorId(id: string): Promise<TipoMomentoMenuResponse> {
      return apiClient
        .get<TipoMomentoMenuResponse>(`/catalogos/tipos-momento-menu/${id}`)
        .then((r) => r.data);
    },
  },

  // Métodos de conveniencia
  listarTiposEvento(): Promise<CatalogoBasicoResponse[]> {
    return this.tiposEvento.listar();
  },
  listarTiposComida(): Promise<CatalogoBasicoResponse[]> {
    return this.tiposComida.listar();
  },
  listarTiposMesa(): Promise<CatalogoBasicoResponse[]> {
    return this.tiposMesa.listar();
  },
  listarTiposSilla(): Promise<CatalogoBasicoResponse[]> {
    return this.tiposSilla.listar();
  },
  listarColores(): Promise<CatalogoBasicoResponse[]> {
    return this.colores.listar();
  },
  listarManteles(): Promise<CatalogoBasicoResponse[]> {
    return this.manteles.listar();
  },
  listarSobremanteles(): Promise<CatalogoBasicoResponse[]> {
    return this.sobremanteles.listar();
  },
  listarTiposAdicional(): Promise<TipoAdicionalResponse[]> {
    return this.tiposAdicional.listar();
  },
  listarPlatos(): Promise<PlatoResponse[]> {
    return this.platos.listar();
  },
  listarTiposMomentoMenu(): Promise<TipoMomentoMenuResponse[]> {
    return this.tiposMomentoMenu.listar();
  },
};

export default catalogosApi;
