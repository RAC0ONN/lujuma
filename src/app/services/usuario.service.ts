import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroCompletoDTO } from '../models/registro-completo.dto';

/*Indica que solo existira una unica instancia del servicio, la cual
sera compartida por todos los componentes
 */
@Injectable({
  providedIn: 'root'
})
/*El service es el puente de comunicacion hacia el back usando las
*petciones HTTP*/
export class UsuarioService {
  // Esta es la url base
  private URL_BASE = 'http://localhost:8080/Usuario';

  constructor(private http: HttpClient) { }

  // Endpoint para el registro completo del usuario
  registrarCompleto(dto: RegistroCompletoDTO): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/RegistrarCompleto`, dto);
  }

  // Endopint que trae todos los usuario mapeados
  obtenerTodosLosUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL_BASE}/ObtenerUsuarios`);
  }
}
