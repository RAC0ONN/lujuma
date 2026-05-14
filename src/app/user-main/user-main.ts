import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-main',
  standalone: false,
  templateUrl: './user-main.html',
  styleUrls: ['./user-main.css'],
})
export class UserMain {
  seccionActiva: string = 'dashboard';


  constructor(private router: Router) {

  }
  cambiarSeccion(target: string) {
    this.seccionActiva = target;
  }
}
