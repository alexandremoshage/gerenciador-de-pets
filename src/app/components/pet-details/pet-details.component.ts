import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PetFacade } from '../../facades/pet.facade';
import { PetCompletoResponse } from '../../models/pet-completo-response';
import { TutorResponse } from '../../models/tutor-response.model';
import { formatCpf, formatPhoneBr } from '../../masks/mask.utils';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-pet-details-modal',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './pet-details.component.html',
  styleUrls: ['./pet-details.component.scss']
})
export class PetDetailsComponent implements OnInit, OnChanges {
  @Input() petId?: number | null = null;
  @Input() openInModal = false;
  @Output() close = new EventEmitter<boolean>();

  readonly pet$: Observable<PetCompletoResponse | null>;
  readonly tutor$: Observable<TutorResponse | null>;
  readonly loading$: Observable<boolean>;

  currentPetId?: number;

  readonly formatCpf = formatCpf;
  readonly formatPhone = formatPhoneBr;

  private readonly destroyRef = inject(DestroyRef);

  constructor(private petFacade: PetFacade) {
    this.pet$ = this.petFacade.selectedPet$;
    this.tutor$ = this.pet$.pipe(map((pet) => (pet?.tutores && pet.tutores.length ? pet.tutores[0] : null)));
    this.loading$ = this.petFacade.loading$;
  }

  ngOnInit(): void {
    if (this.petId != null) {
      this.load(this.petId);
    }

    this.pet$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pet) => {
          if (pet?.id != null) this.currentPetId = pet.id;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['petId']) {
      const nextId = changes['petId'].currentValue as number | null | undefined;
      if (nextId == null) {
        this.currentPetId = undefined;
        this.petFacade.clearSelectedPet();
        return;
      }
      this.load(nextId);
    }
  }

  private load(id: number): void {
    this.currentPetId = id;
    this.petFacade.loadPetById(id);
  }

  dismiss(): void {
    this.close.emit(false);
  }
}
