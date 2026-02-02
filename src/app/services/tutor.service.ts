import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { TutorRequest } from '../models/tutor-request.model';
import { TutorResponse } from '../models/tutor-response.model';
import { PagedResponse } from '../models/paged-response.model';
import { Foto } from '../models/foto.model';


@Injectable({
  providedIn: 'root'
})
export class TutorService {
  private readonly API_URL = `${environment.apiUrl}/v1/tutores`;

  constructor(private http: HttpClient) {}

  create(tutor: TutorRequest): Observable<TutorResponse> {
    return this.http.post<TutorResponse>(this.API_URL, tutor);
  }

  findAll(page = 0, size = 10, nome?: string): Observable<PagedResponse<TutorResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (nome) params = params.set('nome', nome);

    return this.http.get<PagedResponse<TutorResponse>>(this.API_URL, { params });
  }

  findById(id: number): Observable<TutorResponse> {
    return this.http.get<TutorResponse>(`${this.API_URL}/${id}`);
  }

  update(id: number, tutor: TutorRequest): Observable<TutorResponse> {
    return this.http.put<TutorResponse>(`${this.API_URL}/${id}`, tutor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadPhoto(id: number, file: File): Observable<Foto> {
    const formData = new FormData();
    formData.append('foto', file);
    return this.http.post<Foto>(`${this.API_URL}/${id}/fotos`, formData);
  }

  deletePhoto(id: number, fotoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/fotos/${fotoId}`);
  }

  linkPet(tutorId: number, petId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${tutorId}/pets/${petId}`, {});
  }

  unlinkPet(tutorId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${tutorId}/pets/${petId}`);
  }
}