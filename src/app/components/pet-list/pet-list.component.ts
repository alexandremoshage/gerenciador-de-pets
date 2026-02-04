import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingComponent } from '../loading/loading.component';
import { PetFormComponent } from '../pet-form/pet-form.component';
import { PetFacade } from '../../facades/pet.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PetResponse } from '../../models/pet-response.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, LoadingComponent, PetFormComponent],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
  readonly pets$: Observable<PetResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly totalPages$: Observable<number>;
  readonly totalElements$: Observable<number>;

  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  nomeFilter = '';
  racaFilter = '';
  showFormModal = false;
  selectedPetId?: number | null = null;
  @ViewChild('modalDiv') modalDiv?: ElementRef<HTMLDivElement>;

  constructor(private petFacade: PetFacade, private route: ActivatedRoute, private location: Location) {
    this.pets$ = this.petFacade.pets$;
    this.loading$ = this.petFacade.loading$;
    this.totalPages$ = this.petFacade.petsPage$.pipe(map((p) => p?.pageCount ?? 1));
    this.totalElements$ = this.petFacade.petsPage$.pipe(map((p) => p?.total ?? 0));
  }

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
    this.petFacade.loadPetsPage(this.currentPage, this.pageSize, this.nomeFilter || undefined, this.racaFilter || undefined);
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
    if (page >= 0) {
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
