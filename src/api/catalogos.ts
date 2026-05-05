import apiClient from './client';
import type { CatalogoBasicoResponse, CatalogoBasicoRequest, TipoAdicionalResponse } from './types';

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
};

export default catalogosApi;
