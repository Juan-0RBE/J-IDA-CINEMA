import { Component, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { API, Catalogo, textoError } from '../api';
import { ResultadoComponent, ResultadoTransaccion } from '../resultado/resultado.component';

type RespuestaEvento = ResultadoTransaccion & { id_funcion: number | null; anticipacion_dias: number | null };

/** Fecha local en el formato de <input type="datetime-local"> (AAAA-MM-DDTHH:mm). */
function fechaLocal(dias: number, hora = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, 0, 0, 0);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

@Component({
  selector: 'app-evento',
  imports: [FormsModule, ResultadoComponent],
  templateUrl: './evento.component.html',
  styleUrl: './evento.component.scss',
})
export class EventoComponent {
  private http = inject(HttpClient);

  catalogo = input<Catalogo | null>(null);
  cambio = output<void>();

  // Formulario
  idPelicula: number | null = null;
  horaInicio = fechaLocal(15);
  idioma = 'Español';
  nombreSede: string | null = null;
  numSala = 1;
  idEspectador = 1;
  idProyeccionista = 1;
  montaje = {
    area_montaje_m2: 40,
    distribucion: 'Auditorio',
    tarima: true,
    microfonos: 2,
    pantalla: 'Principal',
  };

  enviando = signal(false);
  error = signal<string | null>(null);
  resultado = signal<RespuestaEvento | null>(null);

  diasAnticipacion(): number | null {
    if (!this.horaInicio) {
      return null;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const evento = new Date(this.horaInicio);
    evento.setHours(0, 0, 0, 0);
    return Math.round((evento.getTime() - hoy.getTime()) / 86_400_000);
  }

  enviar(): void {
    if (!this.idPelicula || !this.nombreSede || !this.horaInicio) {
      return;
    }
    const cuerpo = {
      id_pelicula: this.idPelicula,
      hora_inicio: this.horaInicio,
      idioma: this.idioma,
      num_sala: this.numSala,
      nombre_sede: this.nombreSede,
      id_espectador: this.idEspectador,
      id_proyeccionista: this.idProyeccionista,
      montaje: { ...this.montaje },
    };

    this.enviando.set(true);
    this.error.set(null);
    this.resultado.set(null);
    this.http.post<RespuestaEvento>(`${API}/eventos`, cuerpo).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.enviando.set(false);
        this.cambio.emit();
      },
      error: (e) => {
        this.error.set(textoError(e));
        this.enviando.set(false);
      },
    });
  }
}
