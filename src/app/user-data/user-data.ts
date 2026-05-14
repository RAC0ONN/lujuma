import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-data',
  standalone: false,
  templateUrl: './user-data.html',
  styleUrls: ['./user-data.css'],
})
export class UserData {
  constructor(private router: Router) { }
  /*Funcion para avanzar en el formulario*/
  pasoActual: number=1;
  siguientePaso(){
    this.pasoActual++;
  }
}
