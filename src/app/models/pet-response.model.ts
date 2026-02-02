import { Anexo } from "./anexo.model";

export interface PetResponse {
  id: number;
  nome: string;
  raca: string;
  idade: number;
  foto?: Anexo;
}