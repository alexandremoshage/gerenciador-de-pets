import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingComponent } from '../loading/loading.component';
import { TutorFormComponent } from '../tutor-create/tutor-form.component';
import { TutorService } from '../../services/tutor.service';
import { TutorResponse } from '../../models/tutor-response.model';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tutor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, LoadingComponent, TutorFormComponent],
  templateUrl: './tutor-list.component.html',
  styleUrls: ['./tutor-list.component.scss']
})
export class TutorListComponent implements OnInit {
  tutors: TutorResponse[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions = [5, 10, 20, 50];
  nomeFilter = '';
  showFormModal = false;
  selectedTutorId?: number | null = null;
  @ViewChild('modalDiv') modalDiv?: ElementRef<HTMLDivElement>;

  constructor(private tutorService: TutorService, private cdr: ChangeDetectorRef, private location: Location) {}

  ngOnInit(): void {
    this.load();
    const path = this.location.path();
    if (path && path.indexOf('/tutores/create') !== -1) {
      // attempt to parse id query param
      const q = new URLSearchParams(path.split('?')[1] || '');
      this.selectedTutorId = q.get('id') ? +q.get('id')! : null;
      this.showFormModal = true;
      setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
    }
  }

  load(): void {
    this.loading = true;
    this.tutorService.findAll(this.currentPage, this.pageSize, this.nomeFilter || undefined).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (res) => {
        const body = res as any;
        if (body && body.content) {
          this.tutors = body.content;
          this.totalPages = body.pageCount ?? 1;
          this.totalElements = body.total ?? 0;
        } else if (body instanceof Array) {
          this.tutors = body;
          this.totalPages = 1;
          this.totalElements = body.length;
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erro ao carregar tutores:', err)
    });
  }

  create(): void {
    this.selectedTutorId = null;
    this.location.go('/tutores/create');
    this.showFormModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  edit(id: number): void {
    this.selectedTutorId = id;
    this.location.go(`/tutores/create?id=${id}`);
    this.showFormModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  closeModal(saved?: boolean): void {
    this.showFormModal = false;
    this.selectedTutorId = null;
    this.location.replaceState('/tutores');
    if (saved) this.load();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.load();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.load();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  remove(id: number): void {
    if (!confirm('Confirma exclusão do tutor?')) return;
    this.tutorService.delete(id).subscribe({ next: () => this.load(), error: () => alert('Erro ao excluir tutor') });
  }
}
