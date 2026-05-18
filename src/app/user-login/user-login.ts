import { Component, ChangeDetectorRef } from '@angular/core'; // 1. IMPORTAMOS EL DETECTOR DE CAMBIOS
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-user-login',
  standalone: false,
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
})
export class UserLogin {
  campoUsuario: string = '';
  campoContrasenia: string = '';
  campoRespuesta: string = '';
  mostrarRequerimientoPrivacidad: boolean = false;
  preguntaPrivacidad: string = '';
  respuestaCorrectaPrivacidad: string = '';
  usuarioLogueado: any = null;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  // Funcion para hacer el inicio de sesion del usuario
  iniciarSesion() {
    if (!this.campoUsuario || !this.campoContrasenia) {
      alert('Please fill all fields');
      return;
    }

    const usuarioIngresado = this.campoUsuario.trim().toLowerCase();
    const contraseniaIngresada = this.campoContrasenia.trim();

    this.usuarioService.obtenerTodosLosUsuarios().subscribe(
      (usuarios: any[]) => {
         const usuario = usuarios.find(u => {
          const primerNombre = (u.primerNombre || '').toString().trim().toLowerCase();
          const documento = (u.numeroDocumento || u.documento || '').toString().trim();
          return primerNombre === usuarioIngresado && documento === contraseniaIngresada;
        });

        if (usuario) {
          this.usuarioLogueado = usuario;
          this.generarPreguntaAleatoria();
          this.cdr.detectChanges();

        } else {
          alert('Either your password or username are wrong. Please verify.');
        }
      },
      (err: any) => {
          alert('Error in database. Check conection.');
      }
    );
  }
//Metodo para generar la pregunta aleatoria de verificacion de seguridad
  generarPreguntaAleatoria() {
    const pregunta = [
      {
        pregunta: 'What is your registered phone number (with your country cody at start without plus sign)',
        respuesta: this.usuarioLogueado.numeroTelefono
      },
      {
        pregunta: 'What is your registered weight in kg',
        respuesta: this.usuarioLogueado.peso
      },
      {
        pregunta: 'What is your registered height in cm',
        respuesta: this.usuarioLogueado.altura
      }
    ];
  //Generad el indice de la pregunta aleatoria
    const indiceAzar = Math.floor(Math.random() * pregunta.length);
    this.preguntaPrivacidad = pregunta[indiceAzar].pregunta;
    this.respuestaCorrectaPrivacidad = pregunta[indiceAzar].respuesta;

    this.mostrarRequerimientoPrivacidad = true;
  }
  //Metodo que valida si la respuesta es valida o no
  validarPreguntaSeguridad() {
    if (!this.campoRespuesta) {
      alert('Please type your answer.');
      return;
    }

    const respuestaIngresada = this.campoRespuesta.trim().toLowerCase();
    const respuestaCorrecta = this.respuestaCorrectaPrivacidad.toString().trim().toLowerCase();

    if (respuestaIngresada === respuestaCorrecta) {

      //Usuario guardado
      localStorage.setItem('usuarioLogueado', JSON.stringify(this.usuarioLogueado));
      this.mostrarRequerimientoPrivacidad = false;
      this.campoRespuesta = '';
      this.campoUsuario = '';
      this.campoContrasenia = '';

      this.router.navigate(['/main']);
      this.cdr.detectChanges();
    } else {
      alert('Verification failed. Check again.');
    }
  }
}
