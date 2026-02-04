import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PetFacade } from '../../facades/pet.facade';
import { PetCompletoResponse } from '../../models/pet-completo-response';
import { PetResponse } from '../../models/pet-response.model';
import { PetRequest } from '../../models/pet-request.model';
import { ValidationError } from '../../validators/validation-error';

@Component({
  selector: 'app-pet-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss']
})
export class PetFormComponent implements OnInit, OnDestroy, OnChanges {
  nome = '';
  raca = '';
  idade?: number;
  fotoFile?: File;
  fotoUrl?: string;
  fotoPreviewUrl?: string; 
  loading = false;
  isEdit = false;
  petId?: number;
  errorMessage?: string;

  @Input() petIdInput?: number | null = null; 
  @Input() openInModal = false;
  @Output() close = new EventEmitter<boolean>();

  constructor(private petFacade: PetFacade, private router: Router, private route: ActivatedRoute, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadForId(+id);
      }
    });

    if (this.petIdInput) {
      this.loadForId(this.petIdInput);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['petIdInput'] && this.petIdInput) {
      this.loadForId(this.petIdInput);
    }
  }

  private loadForId(id?: number | null): void {
    if (!id) return;
    this.petId = +id;
    this.isEdit = true;
    this.loading = true;
    this.errorMessage = undefined;
    this.petFacade.findById(this.petId).subscribe({
      next: (res: PetCompletoResponse) => {
        this.nome = res.nome ?? '';
        this.raca = res.raca ?? '';
        this.idade = res.idade;
        this.fotoUrl = res.foto?.url ?? undefined;
        if (this.fotoPreviewUrl) {
          URL.revokeObjectURL(this.fotoPreviewUrl);
          this.fotoPreviewUrl = undefined;
        }
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro ao carregar pet para edição', err);
        this.errorMessage = 'Erro ao carregar dados do pet para edição.';
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      if (this.fotoPreviewUrl) {
        URL.revokeObjectURL(this.fotoPreviewUrl);
        this.fotoPreviewUrl = undefined;
      }
      this.fotoFile = input.files[0];
      this.fotoPreviewUrl = URL.createObjectURL(this.fotoFile);
      this.cd.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.fotoPreviewUrl) {
      URL.revokeObjectURL(this.fotoPreviewUrl);
      this.fotoPreviewUrl = undefined;
    }
  }

  submit(): void {
    this.errorMessage = undefined;
    this.loading = true;

    const finalizeSuccess = (resId?: number) => {
      if (this.fotoFile && resId) {
        this.petFacade.uploadPhoto(resId, this.fotoFile!).subscribe({
          next: () => this.afterSuccess(),
          error: () => this.afterSuccess()
        });
      } else {
        this.afterSuccess();
      }
    };

    if (this.isEdit && this.petId) {
      const payload: PetRequest = { nome: this.nome, raca: this.raca || undefined, idade: this.idade };
      this.petFacade.update(this.petId, payload).subscribe({
        next: (res: PetResponse) => finalizeSuccess(res.id ?? this.petId),
        error: (err) => {
          this.loading = false;
          if (err instanceof ValidationError) {
            this.errorMessage = err.message;
            return;
          }
          this.errorMessage = 'Erro ao atualizar pet.';
        }
      });
    } else {
      const payload: PetRequest = { nome: this.nome, raca: this.raca || undefined, idade: this.idade };
      this.petFacade.create(payload).subscribe({
        next: (res: PetResponse) => finalizeSuccess(res.id),
        error: (err) => {
          this.loading = false;
          if (err instanceof ValidationError) {
            this.errorMessage = err.message;
            return;
          }
          this.errorMessage = 'Erro ao criar pet.';
        }
      });
    }
  }

  private afterSuccess(): void {
    this.loading = false;
    this.errorMessage = undefined;
    alert(this.isEdit ? 'Pet atualizado com sucesso' : 'Pet cadastrado com sucesso');
    if (this.openInModal) {
      this.close.emit(true);
    } else {
      this.router.navigate(['/pets']);
    }
  }

  cancel(): void {
    this.errorMessage = undefined;
    if (this.openInModal) {
      this.close.emit(false);
    } else {
      this.router.navigate(['/pets']);
    }
  }
}
