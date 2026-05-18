export interface AlimentoDTO {
  /*Interfaz que actua como el molde de la estructura de los alimentos,
   * como se esperan desde el back*/
  idAlimento?: number;
  nombre: string;
  esLiquido: boolean;
  porcion: number;
  proteina: number;
  carbohidrato: number;
  grasa: number;
  caloria: number;
  azucar: number;
  idUsuario: number;
}
