import { Component, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { API, Catalogo, textoError } from '../api';

interface ItemChecklist {
  item: string;
  obligatorio?: boolean;
  verificado?: boolean;
}

interface FuncionPelicula {
  id_funcion: number;
  fecha_hora: string;
  sede: string;
  sala: number;
  requisitos: {
    formato: string;
    obligatorios: number;
    verificados: number;
    checklist: ItemChecklist[];
  } | null;
}

interface RespuestaCaso2 {
  pelicula: { id_pelicula: number; nombre: string; clasificacion: string; duracion: number };
  ficha: {
    titulo_original: string | null;
    directores: string[];
    elenco: { nombre: string; rol?: string; personaje?: string }[];
    versiones: unknown[];
  } | null;
  ficha_disponible: boolean;
  requisitos_disponibles: boolean;
  funciones: FuncionPelicula[];
  avisos: string[];
}

@Component({
  selector: 'app-caso2',
  imports: [FormsModule, DatePipe],
  templateUrl: './caso2.component.html',
  styleUrl: './caso2.component.scss',
})
export class Caso2Component {
  private http = inject(HttpClient);

  catalogo = input<Catalogo | null>(null);

  idPelicula: number | null = null;
  cargando = signal(false);
  error = signal<string | null>(null);
  datos = signal<RespuestaCaso2 | null>(null);

  consultar(): void {
    if (!this.idPelicula) {
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.http.get<RespuestaCaso2>(`${API}/peliculas/${this.idPelicula}/requisitos`).subscribe({
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

  /** Las versiones en Mongo pueden ser texto u objetos: se muestran como texto plano. */
  describir(v: unknown): string {
    if (v === null || v === undefined) {
      return '';
    }
    if (typeof v !== 'object') {
      return String(v);
    }
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(', ') : val}`)
      .join('  |  ');
  }

  conRequisitos(d: RespuestaCaso2): number {
    return d.funciones.filter((f) => f.requisitos).length;
  }
}
