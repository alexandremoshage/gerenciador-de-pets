import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { PetService } from '../services/pet.service';
import { PetRequest } from '../models/pet-request.model';
import { PetResponse } from '../models/pet-response.model';
import { PagedResponse } from '../models/paged-response.model';
import { PetCompletoResponse } from '../models/pet-completo-response';
import { Anexo } from '../models/anexo.model';

import { ValidationError } from '../validators/validation-error';
import { isBlank } from '../validators/string.utils';

@Injectable({
  providedIn: 'root'
})
export class PetFacade {
  constructor(private petService: PetService) {}

  create(request: PetRequest): Observable<PetResponse> {
    const errorMessage = this.validatePetRequest(request);
    if (errorMessage) return throwError(() => new ValidationError(errorMessage));

    return this.petService.create(this.sanitizePetRequest(request));
  }

  update(id: number, request: PetRequest): Observable<PetResponse> {
    const errorMessage = this.validatePetRequest(request);
    if (errorMessage) return throwError(() => new ValidationError(errorMessage));

    return this.petService.update(id, this.sanitizePetRequest(request));
  }

  findAll(page = 0, size = 99999999, nome?: string, raca?: string): Observable<PagedResponse<PetResponse>> {
    return this.petService.findAll(page, size, nome, raca);
  }

  findById(id: number): Observable<PetCompletoResponse> {
    return this.petService.findById(id);
  }

  delete(id: number): Observable<void> {
    return this.petService.delete(id);
  }

  uploadPhoto(id: number, file: File): Observable<Anexo> {
    return this.petService.uploadPhoto(id, file);
  }

  deletePhoto(id: number, fotoId: number): Observable<void> {
    return this.petService.deletePhoto(id, fotoId);
  }

  private validatePetRequest(request: PetRequest): string | null {
    if (isBlank(request?.nome)) return 'Nome do pet é obrigatório.';
    return null;
  }

  private sanitizePetRequest(request: PetRequest): PetRequest {
    const raca = request.raca?.trim();

    return {
      nome: request.nome.trim(),
      raca: raca && raca.length ? raca : undefined,
      idade: request.idade
    };
  }
}
