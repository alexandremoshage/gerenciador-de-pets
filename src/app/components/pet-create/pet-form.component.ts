import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PetService } from '../../services/pet.service';

@Component({
  selector: 'app-pet-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss']
})
export class PetFormComponent implements OnInit, OnDestroy {
  nome = '';
  raca = '';
  idade?: number;
  fotoFile?: File;
  fotoUrl?: string;
  fotoPreviewUrl?: string; 
  loading = false;
  isEdit = false;
  petId?: number;

  constructor(private petService: PetService, private router: Router, private route: ActivatedRoute, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.petId = +id;
        this.isEdit = true;
        this.loading = true;
        this.petService.findById(this.petId).subscribe({
          next: (res) => {
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
            alert('Erro ao carregar dados do pet para edição');
          }
        });
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
    if (!this.nome) return;
    this.loading = true;

    const finalizeSuccess = (resId?: number) => {
      if (this.fotoFile && resId) {
        this.petService.uploadPhoto(resId, this.fotoFile!).subscribe({
          next: () => this.afterSuccess(),
          error: () => this.afterSuccess()
        });
      } else {
        this.afterSuccess();
      }
    };

    if (this.isEdit && this.petId) {
      const payload = { nome: this.nome, raca: this.raca, idade: this.idade };
      this.petService.update(this.petId, payload).subscribe({
        next: (res) => finalizeSuccess((res as any).id ?? this.petId),
        error: () => {
          this.loading = false;
          alert('Erro ao atualizar pet');
        }
      });
    } else {
      const payload = { nome: this.nome, raca: this.raca, idade: this.idade };
      this.petService.create(payload).subscribe({
        next: (res) => finalizeSuccess((res as any).id),
        error: () => {
          this.loading = false;
          alert('Erro ao criar pet');
        }
      });
    }
  }

  private afterSuccess(): void {
    this.loading = false;
    alert(this.isEdit ? 'Pet atualizado com sucesso' : 'Pet cadastrado com sucesso');
    this.router.navigate(['/pets']);
  }

  cancel(): void {
    this.router.navigate(['/pets']);
  }
}
