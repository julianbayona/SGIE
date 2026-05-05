import apiClient from './client';
import type {
  AnticipoResponse,
  RegistrarAnticipoRequest,
  RecordatorioAnticipoResponse,
  ProgramarRecordatorioRequest,
} from './types';

const pagosApi = {
  /** Registra un anticipo sobre una cotización. */
  registrarAnticipo(
    cotizacionId: string,
    data: RegistrarAnticipoRequest
  ): Promise<AnticipoResponse> {
    return apiClient
      .post<AnticipoResponse>(`/cotizaciones/${cotizacionId}/anticipos`, data)
      .then((r) => r.data);
  },

  /** Programa un recordatorio de anticipo para un evento. */
  programarRecordatorio(
    eventoId: string,
    data: ProgramarRecordatorioRequest
  ): Promise<RecordatorioAnticipoResponse> {
    return apiClient
      .post<RecordatorioAnticipoResponse>(`/eventos/${eventoId}/recordatorios-anticipo`, data)
      .then((r) => r.data);
  },
};

export default pagosApi;
