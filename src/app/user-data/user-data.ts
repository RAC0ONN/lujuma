import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService} from '../services/usuario.service';
import { RegistroCompletoDTO} from '../models/registro-completo.dto';

@Component({
  selector: 'app-user-data',
  standalone: false,
  templateUrl: './user-data.html',
  styleUrls: ['./user-data.css'],
})
export class UserData {
  /*Se inicializa el objeto teniendxo en cuanta el molde definido en
  * el registro completo, aqui estan los valores por defecto*/
  pasoActual: number=1;
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
  codigoPaisInput: string = '+57'

  constructor(
    private usuarioService: UsuarioService,
    private router: Router) { }

  /*Funcion para avanzar en el formulario, el forumlario se divide en 3 partes
  * entonces al recibir un evento de acda boton Next se avanza en el formulario*/
  siguientePaso(){
    if(this.pasoActual<3){
      //Si es menor a 3 sigue con el siguiente paso
      this.pasoActual++;
    }else if(this.pasoActual==3){
      //Si es 3 abre el floatnte para el consentimiento
      this.mostrarConsentimiento = true;
    }
  }
  /*Funcion para terminar el registro del usuario (datos,
  * habitos y consentimiento. Se ajustan y acomodan todos los datos para
  * que sean consistente con los esperados en la base*/
  finalizarRegistro() {
    if (this.terminoAceptado) {
      this.registroData.esAceptado = this.terminoAceptado;

  // En el rpefijo numerico se quita el + y se une el indicadsor al numero
      const prefijo = this.codigoPaisInput.replace('+', '').replace('-', '');
      const numeroEscrito = this.registroData.numeroTelefono;

      if (numeroEscrito > 0) {
        // Se concatenan ambas partes y se pasa a tipo de dato numerico
        this.registroData.numeroTelefono = Number(`${prefijo}${numeroEscrito}`);
      }
      // Se agrega el correo a la lista de correos
      if (this.correoInput.trim() !== '') {
        this.registroData.correos = [this.correoInput.trim()];
      }

      // Se consume el servicio de registrar completo el usuario
      this.usuarioService.registrarCompleto(this.registroData).subscribe({
        next: (response) => {
          alert('Successfully user creation');
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
