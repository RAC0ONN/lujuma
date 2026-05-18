import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroCompletoDTO } from '../models/registro-completo.dto';
import { AlimentoDTO} from '../models/alimento.dto';
import { RecetaCreadaDTO} from '../models/receta-creada.dto';
import { ComidaDTO} from '../models/comida.dto';

/*Indica que solo existira una unica instancia del servicio, la cual
sera compartida por todos los componentes
 */
@Injectable({
  providedIn: 'root'
})
/*El service es el puente de comunicacion hacia el back usando las
*petciones HTTP*/
export class UsuarioService {
  // Esta es la url base de usuario
  private URL_BASE = 'http://localhost:8080/Usuario';
  // Esta es la url base de alimento
  private URL_ALIMENTO='http://localhost:8080/Alimento';
  // Esta es la url base de receta creada
  private URL_RECETA='http://localhost:8080/RecetaCreada';
  // Esta es la url base de comida
  private URL_COMIDA='http://localhost:8080/Comida';

  constructor(private http: HttpClient) { }

  // Endpoint para el registro completo del usuario
  registrarCompleto(dto: RegistroCompletoDTO): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/RegistrarCompleto`, dto);
  }

  // Endopint que trae todos los usuario mapeados
  obtenerTodosLosUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL_BASE}/ObtenerUsuarios`);
  }

  //Endpoint para la creacion de un alimento
  guardarAlimento(alimento: AlimentoDTO): Observable<any> {
    return this.http.post<any>(`${this.URL_ALIMENTO}/CrearAlimento`, alimento);
  }

  //Endpoint que trae todos los elimentos para que se puedan escoger en la receta
  obtenerTodosLosAlimentos(): Observable <AlimentoDTO[]>{
    return this.http.get<AlimentoDTO[]>(`${this.URL_ALIMENTO}/ObtenerAlimentos`);
  }

  //Endpoint para la creacion de la receta
  guardarRecetaCreada(receta: RecetaCreadaDTO): Observable<any> {
    return this.http.post<any>(`${this.URL_RECETA}/CrearReceta`, receta);
  }

  //Endpoint para obtener las comidas de un usuario en un dia
  obtenerComidasPorUsuario(idUsuario: number): Observable<ComidaDTO[]> {
    const params = new HttpParams().set('idUsuario', idUsuario.toString());
    return this.http.get<ComidaDTO[]>(`${this.URL_COMIDA}/ObtenerComidas`, { params });
  }

  //Endpoint para la creacion de una cokmida
  crearComida(comida: ComidaDTO): Observable<any> {
    return this.http.post<any>(`${this.URL_COMIDA}/CrearComida`, comida);
  }

  //Endpoint para traer las recetas
  obtenerRecetas(): Observable<RecetaCreadaDTO[]> {
    return this.http.get<RecetaCreadaDTO[]>(`${this.URL_RECETA}/ObtenerRecetas`);
  }
}
