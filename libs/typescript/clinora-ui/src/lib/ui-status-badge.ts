import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'clinora-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="tone">{{ label }}</span>`,
  styles: `
    span {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .neutral {
      background: #eef1f1;
      color: var(--color-ink, #163c3e);
    }
    .success {
      background: #e4f3e9;
      color: #1e5232;
    }
    .warning {
      background: #fff0d8;
      color: #714310;
    }
    .danger {
      background: #fde7e4;
      color: #8b2929;
    }
  `,
})
export class UiStatusBadge {
  @Input({ required: true }) label = '';
  @Input() tone: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';
}
