import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PetService } from '../services/pet.service';
import { PetResponse } from '../models/pet-response.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
  pets: PetResponse[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(private petService: PetService, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.petService.findAll(this.currentPage, this.pageSize).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (res) => {
        const body = res as any;
        if (body && body.content) {
          this.pets = body.content;
          this.totalPages = body.pageCount ?? 1;
          this.totalElements = body.total ?? 0;
        } else if (body instanceof Array) {
          this.pets = body;
          this.totalPages = 1;
          this.totalElements = body.length;
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erro ao carregar pets:', err)
    });
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.load();
  }

  handlePageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.onPageSizeChange(+value);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.load();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
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
