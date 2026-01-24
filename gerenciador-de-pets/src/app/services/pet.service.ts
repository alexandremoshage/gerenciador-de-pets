import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

import { PetRequest } from '../models/pet-request.model';
import { PetResponse } from '../models/pet-response.model';
import { Anexo } from '../models/anexo.model';
import { PagedResponse } from '../models/paged-response.model';
import { PetCompletoResponse } from '../models/pet-completo-response';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private readonly API_URL = `${environment.apiUrl}/v1/pets`;

  constructor(private http: HttpClient) {}

  create(pet: PetRequest): Observable<PetResponse> {
    return this.http.post<PetResponse>(this.API_URL, pet);
  }

  findAll(page = 0, size = 10, nome?: string, raca?: string): Observable<PagedResponse<PetResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (nome) params = params.set('nome', nome);
    if (raca) params = params.set('raca', raca);

    return this.http.get<PagedResponse<PetResponse>>(this.API_URL, { params });
  }

  findById(id: number): Observable<PetCompletoResponse> {
    return this.http.get<PetCompletoResponse>(`${this.API_URL}/${id}`);
  }

  update(id: number, pet: PetRequest): Observable<PetResponse> {
    return this.http.put<PetResponse>(`${this.API_URL}/${id}`, pet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadPhoto(id: number, file: File): Observable<Anexo> {
    const formData = new FormData();
    formData.append('foto', file); 
    return this.http.post<Anexo>(`${this.API_URL}/${id}/fotos`, formData);
  }

  deletePhoto(id: number, fotoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/fotos/${fotoId}`);
  }
}