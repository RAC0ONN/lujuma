export interface RecetaCreadaDTO {
  /*Interfaz que actua como el molde de la estructura de las recetas,
   * como se esperan desde el back*/
  idReceta?: number;
  nombre: string;
  proteina?: number;
  carbohidrato?: number;
  grasa?: number;
  caloria?: number;
  azucar?: number;
  fecha: string;
  idUsuario: number;
  idAlimentos: number[];
}
