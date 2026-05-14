import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLogin } from './user-login/user-login';
import { UserData } from './user-data/user-data';
import { UserMain } from './user-main/user-main';
const routes: Routes = [
  {path: '', component: UserLogin},
  {path: 'data', component: UserData},
  {path: 'main', component: UserMain},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
