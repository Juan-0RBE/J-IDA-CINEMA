import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';

import { API, textoError } from '../api';

interface Sala {
  id_sala: number;
  sede: string;
  sala: number;
  boletas: number;
  ingresos: number;
  incidentes: number | null;
  fallas: number | null;
  quejas: number | null;
  seguridad: number | null;
  tasa_x1000: number | null;
}

interface RespuestaCaso3 {
  salas: Sala[];
  incidentes_sin_sala: number | null;
  avisos: string[];
}

@Component({
  selector: 'app-caso3',
  imports: [DecimalPipe],
  templateUrl: './caso3.component.html',
  styleUrl: './caso3.component.scss',
})
export class Caso3Component {
  private http = inject(HttpClient);

  cargando = signal(false);
  error = signal<string | null>(null);
  datos = signal<RespuestaCaso3 | null>(null);

  totales = computed(() => {
    const salas = this.datos()?.salas ?? [];
    return {
      boletas: salas.reduce((s, x) => s + x.boletas, 0),
      ingresos: salas.reduce((s, x) => s + x.ingresos, 0),
      incidentes: salas.reduce((s, x) => s + (x.incidentes ?? 0), 0),
      tasaMax: Math.max(0, ...salas.map((x) => x.tasa_x1000 ?? 0)),
    };
  });

  constructor() {
    this.consultar();
  }

  consultar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.http.get<RespuestaCaso3>(`${API}/salas/ventas-incidentes`).subscribe({
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

  anchoTasa(tasa: number | null): number {
    const max = this.totales().tasaMax;
    return tasa && max ? (tasa * 100) / max : 0;
  }
}
