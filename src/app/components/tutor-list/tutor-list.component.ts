import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingComponent } from '../loading/loading.component';
import { TutorFormComponent } from '../tutor-create/tutor-form.component';
import { TutorLinkComponent } from '../tutor-link/tutor-link.component';
import { TutorFacade } from '../../facades/tutor.facade';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { TutorResponse } from '../../models/tutor-response.model';

@Component({
  selector: 'app-tutor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, LoadingComponent, TutorFormComponent, TutorLinkComponent],
  templateUrl: './tutor-list.component.html',
  styleUrls: ['./tutor-list.component.scss']
})
export class TutorListComponent implements OnInit {
  readonly tutors$: Observable<TutorResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly totalPages$: Observable<number>;
  readonly totalElements$: Observable<number>;

  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  nomeFilter = '';
  showFormModal = false;
  selectedTutorId?: number | null = null;
  showLinkModal = false;
  selectedLinkTutorId?: number | null = null;
  @ViewChild('modalDiv') modalDiv?: ElementRef<HTMLDivElement>;

  constructor(private tutorFacade: TutorFacade, private location: Location) {
    this.tutors$ = this.tutorFacade.tutors$;
    this.loading$ = this.tutorFacade.loading$;
    this.totalPages$ = this.tutorFacade.tutorsPage$.pipe(map((p) => p?.pageCount ?? 1));
    this.totalElements$ = this.tutorFacade.tutorsPage$.pipe(map((p) => p?.total ?? 0));
  }

  ngOnInit(): void {
    this.load();
    const path = this.location.path();
    if (path) {
      if (path.indexOf('/tutor/create') !== -1) {
        const q = new URLSearchParams(path.split('?')[1] || '');
        this.selectedTutorId = q.get('id') ? +q.get('id')! : null;
        this.showFormModal = true;
        setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
      } else if (path.indexOf('/tutor/') !== -1 && path.indexOf('/link') !== -1) {
        const parts = path.split('/');
        const tutorIdx = parts.indexOf('tutor');
        const idPart = parts[tutorIdx + 1];
        const id = idPart ? +idPart : null;
        if (id) {
          this.selectedLinkTutorId = id;
          this.showLinkModal = true;
          setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
        }
      }
    }
  }

  load(): void {
    this.tutorFacade.loadTutorsPage(this.currentPage, this.pageSize, this.nomeFilter || undefined);
  }

  create(): void {
    this.selectedTutorId = null;
    this.location.go('/tutor/create');
    this.showFormModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  edit(id: number): void {
    this.selectedTutorId = id;
    this.location.go(`/tutor/create?id=${id}`);
    this.showFormModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  openLink(id: number): void {
    this.selectedLinkTutorId = id;
    this.location.go(`/tutor/${id}/link`);
    this.showLinkModal = true;
    setTimeout(() => this.modalDiv?.nativeElement.focus(), 0);
  }

  closeModal(saved?: boolean): void {
    this.showFormModal = false;
    this.showLinkModal = false;
    this.selectedTutorId = null;
    this.selectedLinkTutorId = null;
    this.location.replaceState('/tutor');
    if (saved) this.load();
  }

  goToPage(page: number): void {
    if (page >= 0) {
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
    this.tutorFacade.delete(id).subscribe({ next: () => this.load(), error: () => alert('Erro ao excluir tutor') });
  }
}
