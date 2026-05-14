import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  standalone: false,
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
})
export class UserLogin {
  constructor (private router: Router) { }
}
