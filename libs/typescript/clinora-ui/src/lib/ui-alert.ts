import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'clinora-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="tone" [attr.role]="tone === 'danger' ? 'alert' : 'status'">
    <ng-content />
  </div>`,
  styles: `
    div {
      padding: 12px 16px;
      border-left: 3px solid;
      border-radius: 4px;
      font: inherit;
    }
    .info {
      background: #edf6f5;
      border-color: var(--color-brand, #367f79);
      color: var(--color-ink, #163c3e);
    }
    .success {
      background: #ecf7ef;
      border-color: var(--color-success, #287849);
      color: #1e5232;
    }
    .warning {
      background: #fff5e6;
      border-color: var(--color-warning, #a4631f);
      color: #714310;
    }
    .danger {
      background: #fff0ee;
      border-color: var(--color-danger, #b34141);
      color: #8b2929;
    }
  `,
})
export class UiAlert {
  @Input() tone: 'info' | 'success' | 'warning' | 'danger' = 'info';
}
