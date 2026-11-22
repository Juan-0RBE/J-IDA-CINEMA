import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API, Catalogo, textoError } from './api';
import { Caso1Component } from './caso1/caso1.component';
import { Caso2Component } from './caso2/caso2.component';
import { Caso3Component } from './caso3/caso3.component';
import { VentaComponent } from './venta/venta.component';
import { EventoComponent } from './evento/evento.component';

type Vista = 'caso1' | 'caso2' | 'caso3' | 'venta' | 'evento';

interface Conexiones {
  postgres: { ok: boolean; error?: string; peliculas?: number; funciones?: number; ventas?: number };
  mongo: { ok: boolean; error?: string; fichas?: number; resenas?: number; incidentes?: number; comprobantes?: number };
}

@Component({
  selector: 'app-root',
  imports: [Caso1Component, Caso2Component, Caso3Component, VentaComponent, EventoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private http = inject(HttpClient);

  vista = signal<Vista>('caso1');
  conexiones = signal<Conexiones | null>(null);
  catalogo = signal<Catalogo | null>(null);
  errorApi = signal<string | null>(null);
  verificando = signal(false);

  secciones: { id: Vista; num: string; titulo: string }[] = [
    { id: 'caso1', num: '01', titulo: 'Función y reseñas' },
    { id: 'caso2', num: '02', titulo: 'Película y requisitos' },
    { id: 'caso3', num: '03', titulo: 'Ventas e incidentes' },
    { id: 'venta', num: '04', titulo: 'Venta de boletas' },
    { id: 'evento', num: '05', titulo: 'Reserva de evento' },
  ];

  constructor() {
    this.recargar();
  }

  recargar(): void {
    this.errorApi.set(null);
    this.verificando.set(true);

    this.http.get<Conexiones>(`${API}/conexiones`).subscribe({
      next: (c) => {
        this.conexiones.set(c);
        this.verificando.set(false);
      },
      error: (e) => {
        this.conexiones.set(null);
        this.errorApi.set(textoError(e));
        this.verificando.set(false);
      },
    });

    this.http.get<Catalogo>(`${API}/catalogo`).subscribe({
      next: (c) => this.catalogo.set(c),
      error: () => this.catalogo.set(null),
    });
  }
}
