// URL del API FastAPI (jida_cinema_api.py) y utilidades mínimas compartidas.

export const API = 'http://localhost:8000/api';

export interface Catalogo {
  peliculas: { id_pelicula: number; nombre: string }[];
  funciones: { id_funcion: number; fecha_hora: string; pelicula: string }[];
  sedes: string[];
  productos: { id_producto: number; nombre: string }[];
}

/** Convierte un error de HttpClient en un texto legible. */
export function textoError(e: unknown): string {
  const err = e as { status?: number; error?: { detail?: unknown } };
  if (err?.status === 0) {
    return 'El API no responde en localhost:8000. Verifica que jida_cinema_api.py esté en ejecución.';
  }
  const detalle = err?.error?.detail;
  if (typeof detalle === 'string') {
    return detalle;
  }
  if (Array.isArray(detalle)) {
    // Errores 422 de validación de FastAPI
    return detalle
      .map((d: { loc?: unknown[]; msg?: string }) => `${(d.loc ?? []).slice(1).join('.')}: ${d.msg}`)
      .join(' / ');
  }
  return `Error ${err?.status ?? 'desconocido'}`;
}
