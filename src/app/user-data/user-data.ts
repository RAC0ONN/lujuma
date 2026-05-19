import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { RegistroCompletoDTO } from '../models/registro-completo.dto';

@Component({
  selector: 'app-user-data',
  standalone: false,
  templateUrl: './user-data.html',
  styleUrls: ['./user-data.css'],
})
export class UserData {
  pasoActual: number = 1;
  mostrarConsentimiento: boolean = false;
  terminoAceptado: boolean = false;
  registroData: RegistroCompletoDTO = {
    numeroDocumento: 0,
    tipoDocumento: 'CC',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    numeroTelefono: 0,
    nivelActividadFisica: 'SEDENTARY',
    peso: 0,
    altura: 0,
    horaSuenio: 0,
    aguaDiaria: 0,
    horaActividadDiaria: 0,
    pasoDiario: 0,
    fechaConsentimiento: new Date().toISOString().substring(0, 10),
    esAceptado: false,
    correos: []
  };
  correoInput: string = '';
  codigoPaisInput: string = '+57';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  siguientePaso() {
    if (this.pasoActual === 1) {
      if (!this.registroData.primerNombre.trim() || !this.registroData.primerApellido.trim()) {
        alert('First name and first lastname are required.');
        return;
      }
      if (!this.registroData.fechaNacimiento) {
        alert('Please select your birth date.');
        return;
      }

      const idStr = String(this.registroData.numeroDocumento || '');
      if (idStr.length !== 10 || isNaN(Number(idStr))) {
        alert('The ID number must be exactly 10 digits.');
        return;
      }

      if (this.registroData.altura <= 0 || String(this.registroData.altura).replace('.', '').length > 4) {
        alert('Height must be a positive number and maximum 4 digits.');
        return;
      }

      if (this.registroData.peso <= 0 || String(this.registroData.peso).replace('.', '').length > 4) {
        alert('Weight must be a positive number and maximum 4 digits.');
        return;
      }

      this.pasoActual++;
    }
    else if (this.pasoActual === 2) {
      if (!this.correoInput.trim().toLowerCase().endsWith('@gmail.com')) {
        alert('The email must end exactly with @gmail.com');
        return;
      }

      const telStr = String(this.registroData.numeroTelefono || '');
      if (telStr.length !== 10 || isNaN(Number(telStr))) {
        alert('The phone number must be exactly 10 digits.');
        return;
      }

      this.pasoActual++;
    }
    else if (this.pasoActual === 3) {
      if (this.registroData.aguaDiaria < 0) {
        alert('Daily water intake cannot be negative.');
        return;
      }
      if (this.registroData.horaSuenio < 0) {
        alert('Hours of sleep cannot be negative.');
        return;
      }
      if (this.registroData.pasoDiario < 0) {
        alert('Daily steps cannot be negative.');
        return;
      }
      if (this.registroData.horaActividadDiaria < 0) {
        alert('Hours of physical activity cannot be negative.');
        return;
      }

      this.mostrarConsentimiento = true;
    }
  }

  finalizarRegistro() {
    if (this.terminoAceptado) {
      this.registroData.esAceptado = this.terminoAceptado;

      const prefijo = this.codigoPaisInput.replace('+', '').replace('-', '');
      const numeroEscrito = this.registroData.numeroTelefono;

      if (numeroEscrito > 0) {
        this.registroData.numeroTelefono = Number(`${prefijo}${numeroEscrito}`);
      }

      if (this.correoInput.trim() !== '') {
        this.registroData.correos = [this.correoInput.trim()];
      }

      this.usuarioService.registrarCompleto(this.registroData).subscribe({
        next: (response) => {
          alert('Successfully user creation.');
          this.mostrarConsentimiento = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          alert('Failed user creation ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
