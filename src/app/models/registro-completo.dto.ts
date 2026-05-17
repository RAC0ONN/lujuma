export interface RegistroCompletoDTO {
 /*Interfaz que actua como el molde de la estructura de los datos,
 * como se esperan desde el back*/
  numeroDocumento: number;
  tipoDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  numeroTelefono: number;
  nivelActividadFisica: string;
  peso: number;
  altura: number;
  horaSuenio: number;
  aguaDiaria: number;
  horaActividadDiaria: number;
  pasoDiario: number;
  fechaConsentimiento: string;
  esAceptado: boolean;
  correos: string[];
}
