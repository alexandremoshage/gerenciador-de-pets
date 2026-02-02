import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() totalElements = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  previous(): void {
    if (this.currentPage > 0) this.pageChange.emit(this.currentPage - 1);
  }

  next(): void {
    if (this.currentPage < this.totalPages - 1) this.pageChange.emit(this.currentPage + 1);
  }

  goTo(page: number): void {
    if (page >= 0 && page < this.totalPages) this.pageChange.emit(page);
  }

  changePageSize(value: number): void {
    this.pageSizeChange.emit(value);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
}
