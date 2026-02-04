import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TutorService } from '../../services/tutor.service';
import { TutorResponse } from '../../models/tutor-response.model';
import { TutorRequest } from '../../models/tutor-request.model';

@Component({
  selector: 'app-tutor-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tutor-form.component.html',
  styleUrls: ['./tutor-form.component.scss']
})
export class TutorFormComponent implements OnInit, OnDestroy {
  nome = '';
  email = '';
  telefone = '';
  endereco = '';
  cpf?: string;
  fotoFile?: File;
  fotoUrl?: string;
  fotoPreviewUrl?: string;
  loading = false;
  isEdit = false;
  tutorId?: number;

  @Input() tutorIdInput?: number | null = null;
  @Input() openInModal = false;
  @Output() close = new EventEmitter<boolean>();

  constructor(private tutorService: TutorService, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.tutorIdInput) {
      this.loadForId(this.tutorIdInput);
    }
  }

  private loadForId(id?: number | null): void {
    if (!id) return;
    this.tutorId = +id;
    this.isEdit = true;
    this.loading = true;
    this.tutorService.findById(this.tutorId).subscribe({
      next: (res: TutorResponse) => {
        this.nome = res.nome ?? '';
        this.email = res.email ?? '';
        this.telefone = res.telefone ?? '';
        this.endereco = res.endereco ?? '';
        this.cpf = res.cpf ?? undefined;
        this.fotoUrl = res.foto?.url ?? undefined;
        if (this.fotoPreviewUrl) {
          URL.revokeObjectURL(this.fotoPreviewUrl);
          this.fotoPreviewUrl = undefined;
        }
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro ao carregar tutor para edição', err);
        alert('Erro ao carregar dados do tutor para edição');
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      if (this.fotoPreviewUrl) {
        URL.revokeObjectURL(this.fotoPreviewUrl);
        this.fotoPreviewUrl = undefined;
      }
      this.fotoFile = input.files[0];
      this.fotoPreviewUrl = URL.createObjectURL(this.fotoFile);
      this.cd.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.fotoPreviewUrl) {
      URL.revokeObjectURL(this.fotoPreviewUrl);
      this.fotoPreviewUrl = undefined;
    }
  }

  submit(): void {
    if (!this.nome || !this.telefone) return;
    this.loading = true;

    const finalizeSuccess = (resId?: number) => {
      if (this.fotoFile && resId) {
        this.tutorService.uploadPhoto(resId, this.fotoFile!).subscribe({
          next: () => this.afterSuccess(),
          error: () => this.afterSuccess()
        });
      } else {
        this.afterSuccess();
      }
    };

    const payload: TutorRequest = { nome: this.nome, email: this.email || undefined, telefone: this.telefone, endereco: this.endereco || undefined, cpf: this.cpf };

    if (this.isEdit && this.tutorId) {
      this.tutorService.update(this.tutorId, payload).subscribe({
        next: (res: TutorResponse) => finalizeSuccess(res.id ?? this.tutorId),
        error: () => {
          this.loading = false;
          alert('Erro ao atualizar tutor');
        }
      });
    } else {
      this.tutorService.create(payload).subscribe({
        next: (res: TutorResponse) => finalizeSuccess(res.id),
        error: () => {
          this.loading = false;
          alert('Erro ao criar tutor');
        }
      });
    }
  }

  private afterSuccess(): void {
    this.loading = false;
    alert(this.isEdit ? 'Tutor atualizado com sucesso' : 'Tutor cadastrado com sucesso');
    if (this.openInModal) {
      this.close.emit(true);
    } else {
      this.router.navigate(['/tutor']);
    }
  }

  cancel(): void {
    if (this.openInModal) {
      this.close.emit(false);
    } else {
      this.router.navigate(['/tutor']);
    }
  }
}
