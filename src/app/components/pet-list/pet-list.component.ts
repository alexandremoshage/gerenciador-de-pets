import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingComponent } from '../loading/loading.component';
import { PetFormComponent } from '../pet-form/pet-form.component';
import { PetFacade } from '../../facades/pet.facade';
import { PetResponse } from '../../models/pet-response.model';
import { PagedResponse } from '../../models/paged-response.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, LoadingComponent, PetFormComponent],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
  pets: PetResponse[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions = [5, 10, 20, 50];
  nomeFilter = '';
  racaFilter = '';
  showFormModal = false;
  selectedPetId?: number | null = null;
  @ViewChild('modalDiv') modalDiv?: ElementRef<HTMLDivElement>;

  constructor(private petFacade: PetFacade, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef, private location: Location) {}

  ngOnInit(): void {
    this.load();
    const path = this.location.path();
    if (path && path.indexOf('/pets/create') !== -1) {
      const qp = this.route.snapshot.queryParams;
      this.selectedPetId = qp['id'] ? +qp['id'] : null;
      this.showFormModal = true;
      setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
    }
  }

  load(): void {
    this.loading = true;
    this.petFacade.findAll(this.currentPage, this.pageSize, this.nomeFilter || undefined, this.racaFilter || undefined).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (body: PagedResponse<PetResponse>) => {
        this.pets = body.content ?? [];
        this.totalPages = body.pageCount ?? 1;
        this.totalElements = body.total ?? 0;
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

  applyFilters(): void {
    this.currentPage = 0;
    this.load();
  }

  clearFilters(): void {
    this.nomeFilter = '';
    this.racaFilter = '';
    this.applyFilters();
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
    this.selectedPetId = null;
    this.location.go('/pets/create');
    this.showFormModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  edit(id: number): void {
    this.selectedPetId = id;
    this.location.go(`/pets/create?id=${id}`);
    this.showFormModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  closeModal(saved?: boolean): void {
    this.showFormModal = false;
    this.selectedPetId = null;
    this.location.replaceState('/pets');
    if (saved) {
      this.load();
    }
  }

  remove(id: number): void {
    if (!confirm('Confirma exclusão do pet?')) return;
    this.petFacade.delete(id).subscribe({
      next: () => this.load(),
      error: () => alert('Erro ao excluir pet')
    });
  }
}
