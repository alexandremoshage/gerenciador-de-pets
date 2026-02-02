import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PetService } from '../../services/pet.service';
import { PetRequest } from '../../models/pet-request.model';

@Component({
  selector: 'app-pet-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pet-create.component.html',
  styleUrls: ['./pet-create.component.scss']
})
export class PetCreateComponent {
  model: PetRequest = { nome: '', raca: '', idade: undefined };
  fotoFile?: File;
  loading = false;

  constructor(private petService: PetService, private router: Router) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fotoFile = input.files[0];
    }
  }

  submit(): void {
    if (!this.model.nome) return;
    this.loading = true;
    this.petService.create(this.model).subscribe({
      next: (res) => {
        if (this.fotoFile) {
          this.petService.uploadPhoto((res as any).id, this.fotoFile).subscribe({
            next: () => this.afterSuccess(),
            error: () => this.afterSuccess()
          });
        } else {
          this.afterSuccess();
        }
      },
      error: () => {
        this.loading = false;
        alert('Erro ao criar pet');
      }
    });
  }

  private afterSuccess(): void {
    this.loading = false;
    alert('Pet cadastrado com sucesso');
    this.router.navigate(['/']);
  }
}
