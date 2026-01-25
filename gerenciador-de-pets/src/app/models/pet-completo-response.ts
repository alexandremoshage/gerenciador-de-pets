import { PetResponse } from './pet-response.model';
import { TutorResponse } from './tutor-response.model';

export interface PetCompletoResponse extends PetResponse {
  tutores: TutorResponse[];
}