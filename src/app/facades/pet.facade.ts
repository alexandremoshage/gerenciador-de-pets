import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

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
  private readonly _petsPage = new BehaviorSubject<PagedResponse<PetResponse> | null>(null);
  readonly petsPage$ = this._petsPage.asObservable();
  readonly pets$ = this.petsPage$.pipe(map((page) => page?.content ?? []));
  readonly totalPages$ = this.petsPage$.pipe(map((page) => page?.pageCount ?? 0));
  readonly totalElements$ = this.petsPage$.pipe(map((page) => page?.total ?? 0));

  private readonly _selectedPet = new BehaviorSubject<PetCompletoResponse | null>(null);
  readonly selectedPet$ = this._selectedPet.asObservable();

  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();

  private readonly _error = new BehaviorSubject<unknown | null>(null);
  readonly error$ = this._error.asObservable();

  private lastListQuery: { page: number; size: number; nome?: string; raca?: string } = { page: 0, size: 99999999 };

  constructor(private petService: PetService) {}

  loadPetsPage(page = 0, size = 99999999, nome?: string, raca?: string): void {
    this.lastListQuery = { page, size, nome, raca };
    this._loading.next(true);
    this._error.next(null);

    this.petService
      .findAll(page, size, nome, raca)
      .pipe(finalize(() => this._loading.next(false)))
      .subscribe({
        next: (body) => this._petsPage.next(body),
        error: (err) => this._error.next(err)
      });
  }

  reloadPetsPage(): void {
    const q = this.lastListQuery;
    this.loadPetsPage(q.page, q.size, q.nome, q.raca);
  }

  loadPetById(id: number): void {
    this._loading.next(true);
    this._error.next(null);
    this.petService
      .findById(id)
      .pipe(finalize(() => this._loading.next(false)))
      .subscribe({
        next: (pet) => this._selectedPet.next(pet),
        error: (err) => this._error.next(err)
      });
  }

  clearSelectedPet(): void {
    this._selectedPet.next(null);
  }

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
