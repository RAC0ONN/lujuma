import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { UserLogin } from './user-login/user-login';
import { UserData } from './user-data/user-data';
import { UserMain } from './user-main/user-main';

@NgModule({
  declarations: [App, UserLogin, UserData, UserMain],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
