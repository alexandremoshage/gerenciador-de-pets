import { Anexo } from './anexo.model';

export interface TutorResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number;
  foto?: Anexo;
}