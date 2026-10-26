import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'clinora-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [type]="type" [disabled]="disabled" [class]="variant">
      <ng-content />
    </button>
  `,
  styles: `
    button {
      min-height: 40px;
      padding: 0 16px;
      border: 1px solid transparent;
      border-radius: var(--radius-control, 4px);
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--color-brand, #367f79);
      outline-offset: 2px;
    }
    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .primary {
      background: var(--color-ink, #163c3e);
      color: white;
    }
    .secondary {
      background: var(--color-paper, white);
      border-color: var(--color-line, #d9e4e1);
      color: var(--color-ink, #163c3e);
    }
    .ghost {
      background: transparent;
      color: var(--color-ink, #163c3e);
    }
  `,
})
export class UiButton {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() disabled = false;
}
