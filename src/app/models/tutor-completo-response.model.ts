import { TutorResponse } from './tutor-response.model';
import { PetResponse } from './pet-response.model';

export interface TutorCompletoResponse extends TutorResponse {
  pets: PetResponse[];
}