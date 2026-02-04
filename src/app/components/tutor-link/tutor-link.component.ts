import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorFacade } from '../../facades/tutor.facade';
import { PetFacade } from '../../facades/pet.facade';
import { forkJoin } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TutorResponse } from '../../models/tutor-response.model';
import { PetResponse } from '../../models/pet-response.model';
import { PagedResponse } from '../../models/paged-response.model';
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

  pets: PetResponse[] = [];
  linked = new Set<number>();
  private initialLinked = new Set<number>();
  loading = false;

  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 0;
  totalElements = 0;
  nomeFilter = '';
  racaFilter = '';

  private readonly destroyRef = inject(DestroyRef);

  constructor(private tutorFacade: TutorFacade, private petFacade: PetFacade, private cdr: ChangeDetectorRef) {}

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
    this.loading = true;

    this.loadTutor(tutorId)
      .pipe(
        switchMap(() => this.loadPetsPage(0, this.pageSize)),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: (err) => console.error('Erro ao carregar dados para vinculação', err)
      });
  }

  private loadTutor(tutorId: number) {
    return this.tutorFacade.findById(tutorId).pipe(
      tap((tutor: TutorResponse) => {
        const ids = new Set<number>((tutor.pets ?? []).map(p => p.id));
        this.initialLinked = ids;
        this.linked = new Set<number>(ids);
      })
    );
  }

  private loadPetsPage(page: number, size: number) {
    this.currentPage = page;
    this.pageSize = size;
    return this.petFacade.findAll(page, size, this.nomeFilter || undefined, this.racaFilter || undefined).pipe(
      tap((body: PagedResponse<PetResponse>) => {
        this.pets = body.content ?? [];
        this.totalPages = body.pageCount ?? 1;
        this.totalElements = body.total ?? 0;
      })
    );
  }

  private resetState(): void {
    this.pets = [];
    this.linked = new Set<number>();
    this.initialLinked = new Set<number>();
    this.loading = false;
    this.currentPage = 0;
    this.totalPages = 0;
    this.totalElements = 0;
    this.cdr.markForCheck();
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

    this.loading = true;
    forkJoin(ops)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
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
    if (page >= 0 && page < this.totalPages) {
      this.loading = true;
      this.loadPetsPage(page, this.pageSize)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          error: (err) => console.error('Erro ao carregar pets para vinculação', err)
        });
    }
  }

  onPageSizeChange(newSize: number): void {
    this.loading = true;
    this.loadPetsPage(0, newSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: (err) => console.error('Erro ao carregar pets para vinculação', err)
      });
  }

  applyFilters(): void {
    this.loading = true;
    this.loadPetsPage(0, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: (err) => console.error('Erro ao carregar pets para vinculação', err)
      });
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
