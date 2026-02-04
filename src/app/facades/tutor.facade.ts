import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { TutorService } from '../services/tutor.service';
import { TutorRequest } from '../models/tutor-request.model';
import { TutorResponse } from '../models/tutor-response.model';
import { PagedResponse } from '../models/paged-response.model';
import { Foto } from '../models/foto.model';

import { ValidationError } from '../validators/validation-error';
import { isBlank } from '../validators/string.utils';
import { isValidCpf, normalizeCpf } from '../validators/cpf.validator';

@Injectable({
  providedIn: 'root'
})
export class TutorFacade {
  constructor(private tutorService: TutorService) {}

  create(request: TutorRequest): Observable<TutorResponse> {
    const errorMessage = this.validateTutorRequest(request);
    if (errorMessage) return throwError(() => new ValidationError(errorMessage));

    return this.tutorService.create(this.sanitizeTutorRequest(request));
  }

  update(id: number, request: TutorRequest): Observable<TutorResponse> {
    const errorMessage = this.validateTutorRequest(request);
    if (errorMessage) return throwError(() => new ValidationError(errorMessage));

    return this.tutorService.update(id, this.sanitizeTutorRequest(request));
  }

  findAll(page = 0, size = 10, nome?: string): Observable<PagedResponse<TutorResponse>> {
    return this.tutorService.findAll(page, size, nome);
  }

  findById(id: number): Observable<TutorResponse> {
    return this.tutorService.findById(id);
  }

  delete(id: number): Observable<void> {
    return this.tutorService.delete(id);
  }

  uploadPhoto(id: number, file: File): Observable<Foto> {
    return this.tutorService.uploadPhoto(id, file);
  }

  deletePhoto(id: number, fotoId: number): Observable<void> {
    return this.tutorService.deletePhoto(id, fotoId);
  }

  linkPet(tutorId: number, petId: number): Observable<void> {
    return this.tutorService.linkPet(tutorId, petId);
  }

  unlinkPet(tutorId: number, petId: number): Observable<void> {
    return this.tutorService.unlinkPet(tutorId, petId);
  }

  private validateTutorRequest(request: TutorRequest): string | null {
    if (isBlank(request?.nome)) return 'Nome é obrigatório.';
    if (isBlank(request?.telefone)) return 'Telefone é obrigatório.';

    const cpfDigits = normalizeCpf(request?.cpf);
    if (cpfDigits.length > 0 && !isValidCpf(cpfDigits)) return 'CPF inválido.';

    return null;
  }

  private sanitizeTutorRequest(request: TutorRequest): TutorRequest {
    const cpfDigits = normalizeCpf(request?.cpf);

    const email = request.email?.trim();
    const endereco = request.endereco?.trim();

    return {
      nome: request.nome.trim(),
      telefone: request.telefone.trim(),
      email: email && email.length ? email : undefined,
      endereco: endereco && endereco.length ? endereco : undefined,
      cpf: cpfDigits.length ? cpfDigits : undefined
    };
  }
}
