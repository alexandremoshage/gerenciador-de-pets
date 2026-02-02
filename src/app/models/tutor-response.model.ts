import { Anexo } from './anexo.model';
import { PetResponse } from './pet-response.model';

export interface TutorResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number;
  foto?: Anexo;
  pets: PetResponse[];
}