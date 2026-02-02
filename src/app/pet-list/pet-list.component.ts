import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PetService } from '../services/pet.service';
import { PetResponse } from '../models/pet-response.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent {
  pets: PetResponse[] = [];
  loading = false;

  constructor(private petService: PetService, private router: Router) {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.petService.findAll().subscribe({
      next: (res) => {
        const body = res as any;
        this.pets = body && body.content ? body.content : (body instanceof Array ? body : []);
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  create(): void {
    this.router.navigate(['/pets/create']);
  }

  edit(id: number): void {
    this.router.navigate(['/pets/create'], { queryParams: { id } });
  }

  remove(id: number): void {
    if (!confirm('Confirma exclusão do pet?')) return;
    this.petService.delete(id).subscribe({
      next: () => this.load(),
      error: () => alert('Erro ao excluir pet')
    });
  }
}
