import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { API, Catalogo, textoError } from '../api';
import { ResultadoComponent, ResultadoTransaccion } from '../resultado/resultado.component';

interface Asiento {
  id_asiento: number;
  fila: string;
  numero: number;
  ocupado: boolean;
}

interface RespuestaAsientos {
  funcion: { id_funcion: number; pelicula: string; sede: string; sala: number; fecha_hora: string; capacidad: number };
  asientos: Asiento[];
}

interface Comprobante {
  id_venta: number;
  codigo: string;
  pelicula: string;
  sede: string;
  sala: number;
  fecha_funcion: string;
  asientos: string[];
  productos: { nombre: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  total_boletas: number;
  total_productos: number;
  total: number;
  metodo_pago: string;
  fecha_emision: string;
}

type RespuestaVenta = ResultadoTransaccion & { id_venta: number | null; comprobante: Comprobante | null };

const MAX_SILLAS = 10;

@Component({
  selector: 'app-venta',
  imports: [FormsModule, DatePipe, DecimalPipe, ResultadoComponent],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.scss',
})
export class VentaComponent {
  private http = inject(HttpClient);

  catalogo = input<Catalogo | null>(null);
  /** Avisa al componente principal que cambiaron los conteos. */
  cambio = output<void>();

  // Formulario
  idFuncion: number | null = null;
  idEspectador = 1;
  idStaff = 1;
  idTipoBoleta = 1;
  metodoPago = 'Tarjeta';
  productos: { id_producto: number | null; cantidad: number }[] = [];

  // Estado
  mapa = signal<RespuestaAsientos | null>(null);
  seleccion = signal<number[]>([]);
  cargandoMapa = signal(false);
  enviando = signal(false);
  error = signal<string | null>(null);
  resultado = signal<RespuestaVenta | null>(null);

  maxSillas = MAX_SILLAS;

  /** Sillas agrupadas por fila para dibujar el mapa. */
  filas = computed(() => {
    const grupos = new Map<string, Asiento[]>();
    for (const a of this.mapa()?.asientos ?? []) {
      grupos.set(a.fila, [...(grupos.get(a.fila) ?? []), a]);
    }
    return [...grupos.entries()].map(([fila, asientos]) => ({ fila, asientos }));
  });

  etiquetasSeleccion = computed(() => {
    const ids = new Set(this.seleccion());
    return (this.mapa()?.asientos ?? []).filter((a) => ids.has(a.id_asiento)).map((a) => `${a.fila}${a.numero}`);
  });

  libres = computed(() => (this.mapa()?.asientos ?? []).filter((a) => !a.ocupado).length);

  cargarMapa(): void {
    if (!this.idFuncion) {
      return;
    }
    this.cargandoMapa.set(true);
    this.error.set(null);
    this.http.get<RespuestaAsientos>(`${API}/funciones/${this.idFuncion}/asientos`).subscribe({
      next: (d) => {
        this.mapa.set(d);
        this.seleccion.set([]);
        this.cargandoMapa.set(false);
      },
      error: (e) => {
        this.mapa.set(null);
        this.error.set(textoError(e));
        this.cargandoMapa.set(false);
      },
    });
  }

  alternar(a: Asiento): void {
    if (a.ocupado) {
      return;
    }
    const actual = this.seleccion();
    if (actual.includes(a.id_asiento)) {
      this.seleccion.set(actual.filter((id) => id !== a.id_asiento));
    } else if (actual.length < MAX_SILLAS) {
      this.seleccion.set([...actual, a.id_asiento]);
    }
  }

  agregarProducto(): void {
    this.productos = [...this.productos, { id_producto: null, cantidad: 1 }];
  }

  quitarProducto(i: number): void {
    this.productos = this.productos.filter((_, j) => j !== i);
  }

  enviar(): void {
    if (!this.idFuncion || !this.seleccion().length) {
      return;
    }
    const cuerpo = {
      id_espectador: this.idEspectador,
      id_staff: this.idStaff,
      id_funcion: this.idFuncion,
      id_tipo_boleta: this.idTipoBoleta,
      asientos: this.seleccion(),
      metodo_pago: this.metodoPago,
      productos: this.productos
        .filter((p) => p.id_producto && p.cantidad > 0)
        .map((p) => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
    };

    this.enviando.set(true);
    this.error.set(null);
    this.resultado.set(null);
    this.http.post<RespuestaVenta>(`${API}/ventas`, cuerpo).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.enviando.set(false);
        this.cargarMapa();
        this.cambio.emit();
      },
      error: (e) => {
        this.error.set(textoError(e));
        this.enviando.set(false);
      },
    });
  }
}
