import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorFacade } from '../../facades/tutor.facade';
import { PetFacade } from '../../facades/pet.facade';
import { BehaviorSubject, combineLatest, forkJoin, Observable } from 'rxjs';
import { filter, finalize, map, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TutorResponse } from '../../models/tutor-response.model';
import { PetResponse } from '../../models/pet-response.model';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-tutor-link',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, LoadingComponent],
  templateUrl: './tutor-link.component.html',
  styleUrls: ['./tutor-link.component.scss']
})
export class TutorLinkComponent implements OnInit, OnChanges {
  @Input() tutorId?: number | null = null;
  @Input() openInModal = false;
  @Output() close = new EventEmitter<boolean>();

  readonly pets$: Observable<PetResponse[]>;
  readonly totalPages$: Observable<number>;
  readonly totalElements$: Observable<number>;

  linked = new Set<number>();
  private initialLinked = new Set<number>();
  private readonly saving$ = new BehaviorSubject<boolean>(false);
  readonly loading$: Observable<boolean>;

  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 0;
  totalElements = 0;
  nomeFilter = '';
  racaFilter = '';

  private readonly destroyRef = inject(DestroyRef);

  constructor(private tutorFacade: TutorFacade, private petFacade: PetFacade) {
    this.pets$ = this.petFacade.pets$;
    this.totalPages$ = this.petFacade.petsPage$.pipe(map((p) => p?.pageCount ?? 1));
    this.totalElements$ = this.petFacade.petsPage$.pipe(map((p) => p?.total ?? 0));
    this.loading$ = combineLatest([this.petFacade.loading$, this.tutorFacade.loading$, this.saving$]).pipe(map(([a, b, c]) => a || b || c));
  }

  ngOnInit(): void {
    if (this.tutorId != null) {
      this.initForTutor(this.tutorId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tutorId']) {
      const nextId = changes['tutorId'].currentValue as number | null | undefined;
      if (nextId == null) {
        this.resetState();
        return;
      }
      this.initForTutor(nextId);
    }
  }

  private initForTutor(tutorId: number): void {
    this.currentPage = 0;

    this.tutorFacade.loadTutorById(tutorId);
    this.tutorFacade.selectedTutor$
      .pipe(
        filter((tutor): tutor is TutorResponse => !!tutor && tutor.id === tutorId),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (tutor) => {
          const ids = new Set<number>((tutor.pets ?? []).map((p) => p.id));
          this.initialLinked = ids;
          this.linked = new Set<number>(ids);
        },
        error: (err) => console.error('Erro ao carregar tutor para vinculação', err)
      });

    this.loadPetsPage(0, this.pageSize);
  }

  private loadPetsPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.petFacade.loadPetsPage(page, size, this.nomeFilter || undefined, this.racaFilter || undefined);
  }

  private resetState(): void {
    this.linked = new Set<number>();
    this.initialLinked = new Set<number>();
    this.currentPage = 0;
    this.tutorFacade.clearSelectedTutor();
  }


  toggle(petId: number, checked: boolean): void {
    if (checked) this.linked.add(petId); else this.linked.delete(petId);
  }

  save(): void {
    if (!this.tutorId) return;

    const toLink: number[] = [];
    const toUnlink: number[] = [];

    this.linked.forEach((id) => {
      if (!this.initialLinked.has(id)) toLink.push(id);
    });
    this.initialLinked.forEach((id) => {
      if (!this.linked.has(id)) toUnlink.push(id);
    });

    if (toLink.length === 0 && toUnlink.length === 0) {
      this.close.emit(true);
      return;
    }

    const ops = [
      ...toLink.map((id) => this.tutorFacade.linkPet(this.tutorId!, id)),
      ...toUnlink.map((id) => this.tutorFacade.unlinkPet(this.tutorId!, id))
    ];

    this.saving$.next(true);
    forkJoin(ops)
      .pipe(
        finalize(() => {
          this.saving$.next(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => this.close.emit(true),
        error: (err) => {
          console.error('Erro ao salvar vínculos', err);
          alert('Erro ao salvar vínculos');
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 0) this.loadPetsPage(page, this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.loadPetsPage(0, newSize);
  }

  applyFilters(): void {
    this.loadPetsPage(0, this.pageSize);
  }

  clearFilters(): void {
    this.nomeFilter = '';
    this.racaFilter = '';
    this.applyFilters();
  }

  cancel(): void {
    this.close.emit(false);
  }
}
