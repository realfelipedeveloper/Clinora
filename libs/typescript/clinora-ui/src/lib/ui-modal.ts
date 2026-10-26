import { DOCUMENT } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';

@Component({
  selector: 'clinora-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="backdrop" (click)="onBackdrop($event)">
        <section
          #dialog
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (keydown)="onKeydown($event)"
        >
          <header>
            <h2>{{ title }}</h2>
            <button type="button" aria-label="Fechar" title="Fechar" (click)="closed.emit()">
              ×
            </button>
          </header>
          <ng-content />
        </section>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 20px;
      background: #102d3199;
    }
    section {
      width: min(100%, 520px);
      max-height: calc(100vh - 40px);
      overflow: auto;
      padding: 24px;
      border-radius: 6px;
      background: var(--color-paper, white);
      color: var(--color-ink, #163c3e);
      box-shadow: 0 16px 48px #102d3133;
    }
    section:focus {
      outline: none;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    button {
      width: 36px;
      height: 36px;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 1.5rem;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--color-brand, #367f79);
    }
  `,
})
export class UiModal implements AfterViewChecked, OnDestroy {
  private readonly document = inject(DOCUMENT);
  @Input({ required: true }) title = '';
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;
  private previouslyFocused?: HTMLElement;
  private focused = false;

  ngAfterViewChecked(): void {
    if (this.open && this.dialog && !this.focused) {
      this.previouslyFocused = this.document.activeElement as HTMLElement;
      this.dialog.nativeElement.focus();
      this.focused = true;
    } else if (!this.open && this.focused) {
      this.restoreFocus();
    }
  }

  ngOnDestroy(): void {
    this.restoreFocus();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closed.emit();
      return;
    }
    if (event.key !== 'Tab' || !this.dialog) return;
    const focusable = Array.from(
      this.dialog.nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (this.document.activeElement === first ||
        this.document.activeElement === this.dialog.nativeElement)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private restoreFocus(): void {
    if (this.focused) this.previouslyFocused?.focus();
    this.focused = false;
  }
}
