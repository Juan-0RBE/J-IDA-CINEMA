import { Component, computed, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';

/** Respuesta común de las dos transacciones cruzadas. */
export interface ResultadoTransaccion {
  ok: boolean;
  origen: string | null;
  mensaje: string;
  pasos: string[];
  antes: Record<string, number | null>;
  despues: Record<string, number | null>;
}

interface Paso {
  motor: 'pg' | 'mongo' | 'otro';
  etiqueta: string;
  texto: string;
  reversa: boolean;
}

@Component({
  selector: 'app-resultado',
  imports: [KeyValuePipe],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.scss',
})
export class ResultadoComponent {
  resultado = input.required<ResultadoTransaccion>();

  /** Separa "PostgreSQL: texto" en motor y texto para mostrar la bitácora. */
  pasos = computed<Paso[]>(() =>
    this.resultado().pasos.map((p) => {
      const i = p.indexOf(':');
      const etiqueta = i > 0 ? p.slice(0, i) : '';
      const texto = i > 0 ? p.slice(i + 1).trim() : p;
      const motor = etiqueta === 'PostgreSQL' ? 'pg' : etiqueta === 'MongoDB' ? 'mongo' : 'otro';
      return { motor, etiqueta, texto, reversa: /ROLLBACK|compensaci/i.test(p) };
    }),
  );

  origenTexto = computed(() => {
    switch (this.resultado().origen) {
      case 'validacion':
        return 'Validación de datos';
      case 'postgresql':
        return 'PostgreSQL';
      case 'mongodb':
        return 'MongoDB';
      case null:
        return '';
      default:
        return 'Otro';
    }
  });

  diferencia(antes: number | null, despues: number | null): string {
    if (antes === null || despues === null) {
      return 'N/D';
    }
    const d = despues - antes;
    return d > 0 ? `+${d}` : `${d}`;
  }
}
