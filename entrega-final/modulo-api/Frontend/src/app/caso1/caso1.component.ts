import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { API, Catalogo, textoError } from '../api';

interface Resena {
  id_espectador: number;
  nombre_espectador: string;
  calificacion: number;
  texto: string;
  fecha: string;
}

interface Funcion {
  id_funcion: number;
  fecha_hora: string;
  id_pelicula: number;
  pelicula: string;
  sede: string;
  sala: number;
  capacidad: number;
  boletas_vendidas: number;
}

interface RespuestaCaso1 {
  funcion: Funcion;
  resenas: Resena[] | null;
  promedio: number | null;
  avisos: string[];
}

@Component({
  selector: 'app-caso1',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './caso1.component.html',
  styleUrl: './caso1.component.scss',
})
export class Caso1Component {
  private http = inject(HttpClient);

  catalogo = input<Catalogo | null>(null);

  idFuncion: number | null = null;
  cargando = signal(false);
  error = signal<string | null>(null);
  datos = signal<RespuestaCaso1 | null>(null);

  /** Cuántas reseñas hay de cada calificación (5 a 1). */
  distribucion = computed(() => {
    const resenas = this.datos()?.resenas ?? [];
    const total = resenas.length || 1;
    return [5, 4, 3, 2, 1].map((nota) => {
      const cantidad = resenas.filter((r) => r.calificacion === nota).length;
      return { nota, cantidad, porcentaje: Math.round((cantidad * 100) / total) };
    });
  });

  consultar(): void {
    if (!this.idFuncion) {
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.http.get<RespuestaCaso1>(`${API}/funciones/${this.idFuncion}/resenas`).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.cargando.set(false);
      },
      error: (e) => {
        this.datos.set(null);
        this.error.set(textoError(e));
        this.cargando.set(false);
      },
    });
  }

  ocupacion(f: Funcion): number {
    return f.capacidad ? Math.min(100, Math.round((f.boletas_vendidas * 100) / f.capacidad)) : 0;
  }
}
