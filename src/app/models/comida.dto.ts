export type TipoComida = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
/*Interfaz que actua como el molde de la estructura de las comidas,
   * como se esperan desde el back*/
export interface ComidaDTO {
  idComida?: number;
  tipo: TipoComida;
  proteina: number;
  carbohidrato: number;
  grasa: number;
  caloria: number;
  azucar: number;
  idReporte?: number;
  idUsuario: number;
  idCalendario?: number;
  idRecetas?: number[];
}

