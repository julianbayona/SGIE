import apiClient from './client';
import type {
  CotizacionResponse,
  GenerarCotizacionRequest,
  ActualizarItemCotizacionRequest,
  ActualizarItemsCotizacionRequest,
} from './types';

const cotizacionesApi = {
  /** Genera una nueva cotización para una reserva. */
  generar(reservaRaizId: string, data: GenerarCotizacionRequest): Promise<CotizacionResponse> {
    return apiClient
      .post<CotizacionResponse>(`/reservas/${reservaRaizId}/cotizaciones`, data)
      .then((r) => r.data);
  },

  /** Obtiene una cotización por su UUID. */
  obtenerPorId(id: string): Promise<CotizacionResponse> {
    return apiClient.get<CotizacionResponse>(`/cotizaciones/${id}`).then((r) => r.data);
  },

  /** Obtiene la cotización vigente de una reserva. */
  obtenerVigente(reservaRaizId: string): Promise<CotizacionResponse> {
    return apiClient
      .get<CotizacionResponse>(`/reservas/${reservaRaizId}/cotizacion-vigente`)
      .then((r) => r.data);
  },

  /** Actualiza el precio de un ítem individual. */
  actualizarItem(
    cotizacionId: string,
    itemId: string,
    data: ActualizarItemCotizacionRequest
  ): Promise<CotizacionResponse> {
    return apiClient
      .patch<CotizacionResponse>(`/cotizaciones/${cotizacionId}/items/${itemId}`, data)
      .then((r) => r.data);
  },

  /** Actualiza múltiples ítems de una cotización en una sola llamada. */
  actualizarItems(
    cotizacionId: string,
    data: ActualizarItemsCotizacionRequest
  ): Promise<CotizacionResponse> {
    return apiClient
      .put<CotizacionResponse>(`/cotizaciones/${cotizacionId}/items`, data)
      .then((r) => r.data);
  },

  /** Genera el documento PDF de la cotización. */
  generarDocumento(id: string): Promise<CotizacionResponse> {
    return apiClient
      .patch<CotizacionResponse>(`/cotizaciones/${id}/generar`)
      .then((r) => r.data);
  },

  /** Envía la cotización al cliente. */
  enviar(id: string): Promise<CotizacionResponse> {
    return apiClient
      .patch<CotizacionResponse>(`/cotizaciones/${id}/enviar`)
      .then((r) => r.data);
  },

  /** Registra la aceptación de la cotización. */
  aceptar(id: string): Promise<CotizacionResponse> {
    return apiClient
      .patch<CotizacionResponse>(`/cotizaciones/${id}/aceptar`)
      .then((r) => r.data);
  },

  /** Registra el rechazo de la cotización. */
  rechazar(id: string): Promise<CotizacionResponse> {
    return apiClient
      .patch<CotizacionResponse>(`/cotizaciones/${id}/rechazar`)
      .then((r) => r.data);
  },
};

export default cotizacionesApi;
