import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

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
  private readonly _tutorsPage = new BehaviorSubject<PagedResponse<TutorResponse> | null>(null);
  readonly tutorsPage$ = this._tutorsPage.asObservable();
  readonly tutors$ = this.tutorsPage$.pipe(map((page) => page?.content ?? []));
  readonly totalPages$ = this.tutorsPage$.pipe(map((page) => page?.pageCount ?? 0));
  readonly totalElements$ = this.tutorsPage$.pipe(map((page) => page?.total ?? 0));

  private readonly _selectedTutor = new BehaviorSubject<TutorResponse | null>(null);
  readonly selectedTutor$ = this._selectedTutor.asObservable();

  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();

  private readonly _error = new BehaviorSubject<unknown | null>(null);
  readonly error$ = this._error.asObservable();

  private lastListQuery: { page: number; size: number; nome?: string } = { page: 0, size: 10 };

  constructor(private tutorService: TutorService) {}

  loadTutorsPage(page = 0, size = 10, nome?: string): void {
    this.lastListQuery = { page, size, nome };
    this._loading.next(true);
    this._error.next(null);

    this.tutorService
      .findAll(page, size, nome)
      .pipe(finalize(() => this._loading.next(false)))
      .subscribe({
        next: (body) => this._tutorsPage.next(body),
        error: (err) => this._error.next(err)
      });
  }

  reloadTutorsPage(): void {
    const q = this.lastListQuery;
    this.loadTutorsPage(q.page, q.size, q.nome);
  }

  loadTutorById(id: number): void {
    this._loading.next(true);
    this._error.next(null);
    this.tutorService
      .findById(id)
      .pipe(finalize(() => this._loading.next(false)))
      .subscribe({
        next: (tutor) => this._selectedTutor.next(tutor),
        error: (err) => this._error.next(err)
      });
  }

  clearSelectedTutor(): void {
    this._selectedTutor.next(null);
  }

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
